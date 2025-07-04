---
sidebar_position: 1
title: LensVM
slug: /lensvm
---

## Introduction

LensVM is a bi-directional data transformation engine originally developed for DefraDB, now available as a standalone tool. It enables transforming data both forwards and in reverse directions using user-defined modules called Lenses, which are compiled to WebAssembly (WASM). Each Lens runs inside a secure, sandboxed WASM environment, enabling safe and modular pipelines, even when composed from multiple sources.

This guide provides the foundational steps for writing and composing Lenses using the LensVM framework. It includes examples for Rust-based Lenses using the official SDK, as well as lower-level implementations without the SDK in other languages.

## Before you begin

Before getting started, ensure the following are installed:

- [Golang](https://golang.google.cn/doc/install) (required to run the Lens engine)
- WASM-compatible compiler: Choose a compiler that targets the `wasm32-unknown` architecture, based on your preferred programming language.

**Note**: The LensVM Engine executes Lenses in isolated WASM environments. It manages data flow, memory allocation, and function calls between the host application and the Lens module.

## Writing lenses

Lenses can be authored in any language that compiles to valid WebAssembly. To interface with the LensVM engine, each Lens must implement a specific set of exported and imported functions.

### Required and optional functions

Each Lens must implement the following interface:

| Function               | Type      | Required | Description |
|:-----------------------|:----------|:---------|:------------|
| `alloc(unsigned64)`    | Exported  | Yes        | Allocates memory for LensVM to store input data. |
| `next() -> unsigned8`  | Imported  | Yes        | Retrieves the next input item from the LensVM engine. |
| `set_param(unsigned8) -> unsigned8` | Exported | No | (Optional) Accepts configuration data before input processing begins. |
| `transform() -> unsigned8` | Exported | Yes     | Core transformation function. Applies logic to one or more inputs and returns the output. |
| `inverse() -> unsigned8`   | Exported | No     | (Optional) Performs reverse transformation using the same interface as `transform()`. |

### WASM data format

LensVM communicates with Lenses using a binary format across the WASM boundary. The format is as follows:

```json

[TypeId][Length][Payload]
```

- **TypeId**: A signed 8-byte integer
- **Length**: An optional unsigned 32-byte integer, depending on the TypeId
- **Payload**: Raw binary or serialized data (e.g., JSON)

#### TypeId Values

| TypeId | Meaning            | Notes |
|:-------|:--------------------|:------|
| `-1`   | Error               | May include an error message in the Payload. |
| `0`    | Nil                | No `Length` or `Payload`. |
| `1`    | JSON               | Payload contains a JSON-serialized object. |
| `127`  | End of Stream      | Signals that there are no more items to process. |

### Developing with the Rust SDK

To simplify development, LensVM provides a [Rust SDK](https://docs.rs/lens_sdk). It abstracts much of the boilerplate required to build Lenses, allowing you to focus on transformation logic.

The SDK:

- Implements the required interface automatically
- Handles safe memory and data exchange across the WASM boundary
- Provides helpful macros and utilities for Lens definition

You can find it on [crates.io](https://crates.io/crates/lens_sdk) and in the official [GitHub repository](https://github.com/lens-vm/lens).

### Example Lenses

Example Lenses written in:

- [Rust](https://www.rust-lang.org/)
- [AssemblyScript](https://www.assemblyscript.org/)

can be found in this repository and in [DefraDB](https://github.com/sourcenetwork/defradb).

## Basic Lens Example

The easiest way to get started writing a Lens is by using Rust, thanks to the [`lens_sdk`](https://docs.rs/lens_sdk) crate, which provides helpful macros and utilities for Lens development.

A minimal example is shown in the [`define!` macro documentation](https://docs.rs/lens_sdk/latest/lens_sdk/macro.define.html#examples). This example demonstrates a simple forward transformation that iterates through input documents and increments the `age` field by 1.

## Writing a Lens using the SDK

Writing a Lens with the Rust SDK is straightforward and well-documented. The examples provided in the [`lens_sdk` documentation](https://docs.rs/lens_sdk) build progressively:

- **Example 1:** A minimal forward transformation using the `define!` macro.
- **Example 2:** Adds parameters and an inverse function to demonstrate bi-directional transformations.

For more advanced examples, refer to the following repositories:

- [Lens test modules](https://github.com/lens-vm/lens/blob/main/tests/modules)
- [DefraDB lens tests](https://github.com/sourcenetwork/defradb/tree/develop/tests/lenses)

These cover schema-aware transformations, reversible pipelines, and other real-world use cases.

## Writing a Lens without the SDK

Creating a Lens without the Rust SDK is intended for advanced use cases—such as developing in non-Rust languages or needing fine-grained control over serialization and transformation behavior.

Currently, the only working non-Rust example is written in [AssemblyScript](https://www.assemblyscript.org/introduction.html):

- [AssemblyScript Lens Example](https://github.com/lens-vm/lens/blob/main/tests/modules/as_wasm32_simple/assembly/index.ts)

This approach requires:

- Manual implementation of memory allocation and serialization
- A deep understanding of the LensVM protocol
- Proficiency in AssemblyScript (or your chosen language)

> **Recommendation:** For most users, we strongly recommend using the [Rust SDK](https://docs.rs/lens_sdk), even partially. It can significantly reduce development time and complexity. You can start with full SDK support and incrementally replace parts with custom logic as needed.

## Composing Lenses

Lenses can be composed into pipelines using the Go `config` sub-package:

- [Go Config Package](https://github.com/lens-vm/lens/tree/main/host-go/config)

Pipeline composition is handled via the `model.Lens` type:

- [`model.Lens` Definition](https://github.com/lens-vm/lens/blob/main/host-go/config/model/lens.go)

You can compose pipelines either by:

- Supplying a `model.Lens` object directly
- Referencing a JSON configuration file (from local storage or a URL) that conforms to the `model.Lens` schema

> **Note:** Composing Lenses does **not** execute them. Instead, it builds an enumerable pipeline object, which you can then iterate over to apply transformations.

You can extend this enumerable pipeline by:

- Adding additional Lenses through the `config` package
- Chaining in native Go-based enumerables for advanced customization

### Composition Examples

For practical examples of pipeline composition, explore the following:

- [Go engine tests](https://github.com/lens-vm/lens/tree/main/host-go/engine/tests)
- [CLI integration tests](https://github.com/lens-vm/lens/tree/main/tests/integration/cli)

These examples demonstrate how to build and extend Lens pipelines declaratively for various environments and workflows.
