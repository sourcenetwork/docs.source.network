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
## Getting Started

### Prerequisites

- Install `defradb cli` locally or an accessible remote node.
- Install GraphQL client (e.g. GraphiQL). See download [link](https://www.electronjs.org/apps/graphiql).

### SetUp

Set up a DefraDB node with this command in the terminal:
- `defradb start`

This action prompts the following items:
- Starts a node with default settings (running at http://localhost:9181)
- Creates a configuration file at $HOME/.defra/config.yaml, which is the user home directory

DefraDB supports two storage engines:
- BadgerDB (used by default, provides disk-backed persistent storage)
- In-memory store

To choose a storage type you can
- use `--store` option with the start command, or
- edit the local config file

{{( note )}}

If you are using BadgerDB, and you encounter the following error: Failed to initiate database:Map log file. Path=.defradb/data/000000.vlog. Error=exec format error

It means terminal client doesn't support Mmap'ed files. This is common with older version of Ubuntu on Windows va WSL. Unfortuently, BadgerDB uses Mmap to interact with the filesystem, so you will need to use a terminal client which supports it.

{{< /note >}}

Once your local environment is setup, you can test your connection with:

defradb client ping

which should respond with Success!

Once you've confirmed your node is running correctly, if you're using the GraphiQL client to interact with the database, then make sure you set the GraphQL Endpoint to http://localhost:9181/graphql and the Method to GET.