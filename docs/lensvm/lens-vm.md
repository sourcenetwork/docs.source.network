---
sidebar_position: 1
title: LensVM
slug: /lensvm
---


## Introduction

LensVM is a bi-directional data transformation engine originally developed for DefraDB, now available as a standalone tool.

It enables transforming data both forwards and in reverse directions using user-defined modules called Lenses, which are compiled to WebAssembly (WASM). Each Lens runs inside a secure, sandboxed WASM environment, enabling safe and modular pipelines, even when composed from multiple sources.

This guide provides the foundational steps for writing and composing Lenses using the LensVM framework. It includes examples for Rust-based Lenses using the official SDK, as well as lower-level implementations without the SDK in other languages.

## Before you begin

Before getting started, ensure the following are installed:

- [Golang](https://golang.google.cn/doc/install) (required to run the Lens engine)

- WASM compiler (for your language of choice)
  - You’ll need a compiler that targets the `wasm32-unknown` architecture.

**Note**: A LensVM Engine is the runtime that executes Lenses in isolated WebAssembly environments, managing data flow, memory, and function calls between the host and the Lens.

## Writing lenses

Lenses can be written in any language that compiles to valid WebAssembly (WASM). The LensVM engine interacts with the compiled Lens module via a specific set of exported and imported functions.

### Required and optional functions

Each Lens must implement the following interface:

| Function               | Type      | Required | Description |
|:-----------------------|:----------|:---------|:------------|
| `alloc(unsigned64)`    | Exported  | Yes        | Allocates a memory block of the given size. Called by the LensVM engine. |
| `next() -> unsigned8`  | Imported  | Yes        | Called by the Lens to retrieve a pointer to the next input data item from the engine. |
| `set_param(unsigned8) -> unsigned8` | Exported | No | Accepts static configuration data at initialization. Receives a pointer to the config and returns a pointer to an OK or error response. Called once before any input is processed. |
| `transform() -> unsigned8` | Exported | Yes     | Core transformation logic. Pulls zero or more inputs using `next()`, applies transformation, and returns a pointer to a single output item. Supports stateful transformations. |
| `inverse() -> unsigned8`   | Exported | No     | Optional reverse transformation logic, same interface as `transform()`. |

### WASM data format

Data passed across the WASM boundary—into `set_param()`, `transform()`, and `inverse()`—follows this binary format:

```json

[TypeId][Length][Payload]
```

- **TypeId**: Signed 8-byte integer  
- **Length**: Unsigned 32-byte integer (optional depending on TypeId)  
- **Payload**: Raw binary or serialized data (e.g., JSON)

#### TypeId Values

| TypeId | Meaning            | Notes |
|:-------|:--------------------|:------|
| `-1`   | Error               | May include an error message in the Payload. |
| `0`    | Nil                | No `Length` or `Payload`. |
| `1`    | JSON               | Payload contains a JSON-serialized object. |
| `127`  | End of Stream      | Indicates there are no more items to process. |

### Rust SDK

To simplify Lens development, a [Rust SDK](https://docs.rs/lens_sdk) is available. It handles memory allocation, pointer management, and payload formatting, so you can focus on writing transformation logic.

Available on [crates.io](https://crates.io/crates/lens_sdk) and GitHub: [lens-vm/lens](https://github.com/lens-vm/lens)

### Example Lenses

Example Lenses written in:

- [Rust](https://www.rust-lang.org/)
- [AssemblyScript](https://www.assemblyscript.org/)

can be found in this repository and in [DefraDB](https://github.com/worldsibu/defradb).

## Building

Once you have the listed prerequisites installed, you should be able to build everything in the repository and run all the tests by running `make test` from the repository root.

### Prerequisites

The following tools need to be installed and added to your PATH before you can build the full contents of the repository:

- [rustup](https://www.rust-lang.org/tools/install) and Cargo/rustc, typically installed via rustup.
  - Please pay attention to any prerequisites, for example if on Ubuntu you may need to install the `build-essential` package
- If connection errors are experienced when retrieving rust package dependencies from crates.io, you might need to tweak your `.gitconfig` as per this [comment](https://github.com/rust-lang/cargo/issues/3381#issuecomment-1193730972).
- `npm`, typically installed via [nvm](https://github.com/nvm-sh/nvm#install--update-script)
- [Go](https://golang.google.cn/doc/install)

## Basic Lens Example

The easiest way to get started writing a Lens is by using Rust, thanks to the [`lens_sdk`](https://docs.rs/lens_sdk/0.8.0/lens_sdk) crate, which provides helpful macros and utilities for Lens development.

A minimal example is shown in the [`define!` macro documentation](https://docs.rs/lens_sdk/0.8.0/lens_sdk/macro.define.html#examples). This example demonstrates a simple forward transformation that iterates through input documents and increments the `age` field by 1.

## Writing a Lens (SDK)

Writing a simple Lens using the Rust SDK is straightforward, and the process is well documented in the [`lens_sdk` crate documentation](https://docs.rs/lens_sdk/0.8.0/lens_sdk).

As shown in the [Basic Lens Example](#basic-lens-example), the first example demonstrates a minimal forward transformation. The second example in the [`define!` macro docs](https://docs.rs/lens_sdk/0.8.0/lens_sdk/macro.define.html#examples) builds upon this by introducing parameters and an inverse function, showcasing how Lenses can support bi-directional transformations.

For more real-world and test-driven examples, explore the following repositories:

- [Lens test modules](https://github.com/lens-vm/lens/blob/main/tests/modules)
- [DefraDB lens tests](https://github.com/sourcenetwork/defradb/tree/develop/tests/lenses)

These examples provide additional context and cover a range of use cases, including schema-aware transformations and reversible pipelines.

## Writing a Lens (without SDK)

Writing a Lens without using the Rust SDK is significantly more involved and intended for advanced users who want to build in languages other than Rust, or prefer full control over serialization and transformation logic.

Currently, the only working example we have is written in [AssemblyScript](https://www.assemblyscript.org/introduction.html). You can find it here:

- [AssemblyScript Lens example](https://github.com/lens-vm/lens/blob/main/tests/modules/as_wasm32_simple/assembly/index.ts)

This example demonstrates a minimal Lens implementation without the support of an SDK. However, it requires:

- A deep understanding of the Lens transfer protocol
- Manual implementation of (de)serialization logic
- Proficiency in AssemblyScript or your language of choice

**Note:** The AssemblyScript example was created as a proof of concept and may not reflect best practices. It was also the author’s first and only project in that language.

### Recommendation

For most use cases, we recommend using the [Rust SDK](https://docs.rs/lens_sdk/0.8.0/lens_sdk), even partially. The SDK simplifies the process considerably and can be adopted incrementally — you can start with full SDK support and gradually replace pieces with handcrafted logic as needed.

However, this approach is limited to Rust. If you plan to write Lenses in other languages, you’ll need to implement everything from scratch, including the data model handling and WASM interface.

## Composing Lenses

Lenses can be composed into transformation pipelines using the Go `config` sub-package:

- [Go Config Package](https://github.com/lens-vm/lens/tree/main/host-go/config)

Composition is handled via the `model.Lens` type:

- [`model.Lens` definition](https://github.com/lens-vm/lens/blob/main/host-go/config/model/lens.go)

You can configure composition by supplying either a `model.Lens` object directly or by referencing a JSON file (from the local filesystem or an HTTP URL) that conforms to the `model.Lens` schema.

> **Note:** Configuring Lenses does **not** execute them. Instead, it returns an enumerable pipeline that you can iterate through to apply the configured transformations.

This enumerable can be extended by:

- Composing additional Lenses using the `config` package
- Chaining in native enumerable implementations to enrich or customize the pipeline

### Examples

You can find working examples and test coverage of Lens composition in the following repositories:

- [Go engine tests](https://github.com/lens-vm/lens/tree/main/host-go/engine/tests)
- [CLI integration tests](https://github.com/lens-vm/lens/tree/main/tests/integration/cli)

These examples demonstrate how to declaratively build and extend Lens pipelines for different execution environments.
