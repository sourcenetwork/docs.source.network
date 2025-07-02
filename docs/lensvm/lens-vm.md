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

```

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
