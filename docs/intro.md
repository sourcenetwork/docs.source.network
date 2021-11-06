---
sidebar_position: 1
---

# Getting Started

## Overview

DefraDB is a peer-to-peer(P2P) Edge Database with a NoSQL document store interface. DefraDB's data model is the core data storage system for Source Ecosystem. It is:
- backed by MerkleCRDTs for multi write-master architecture
- built using IPFS technologies (IPLD, LibP2P) and features Semantic web3 properties.

## Early Access
DefraDB is currently in a *Early Access Alpha* program, and is not currently ready for production deployments. For support with your use-case and deployment, please contact [Source](https://source.network/) by [email](mailto:hello@source.network).

## Installation
To install a DefraDB node, you can either:
- download the pre-compiled binaries available from the releases page, or
    ```
    go install github.com/sourcenetwork/defradb/cli/defradb
    ```
- compile it yourself if you have a local [Go Toolchain](https://golang.org/) installed

    ```
    git clone git@github.com:sourcenetwork/defradb-early-access.git
    mv defradb-early-access defradb # Rename the folder
    cd defradb/cli/defradb
    go install
    ```

## CLI Documentation

See here for the  generated documentation for the shipped CLI interface here.

