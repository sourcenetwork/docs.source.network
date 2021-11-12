---
sidebar_position: 1
---

# Getting Started

## Overview
DefraDB is a peer-to-peer(P2P) Edge Database with a NoSQL document store interface. DefraDB's data model is the core data storage system for [Source](https://source.network/) Ecosystem. It is:
- backed by [MerkleCRDTs](https://arxiv.org/pdf/2004.00107.pdf) for multi write-master architecture.
- built using [IPFS](https://ipfs.io/) technologies ([IPLD](https://docs.ipld.io/), [LibP2P](https://libp2p.io/)) and features Semantic web3 properties.

See the [Technical Overview](https://docsend.com/view/mczj7ic4i3kqpq7s) here.

## Early Access
DefraDB is currently an *Early Access Alpha* program (not ready for production deployments). Contact [Source](https://source.network/) by [email](mailto:hello@source.network) for support with your use-case and deployment.

## Installation
To install a DefraDB node, you can either:
- download the pre-compiled binaries available from the releases page, or
    ```gql
    go install github.com/sourcenetwork/defradb/cli/defradb
    ```
- compile it yourself if you have a local [Go Toolchain](https://golang.org/) installed

    ```gql
    git clone git@github.com:sourcenetwork/defradb-early-access.git
    mv defradb-early-access defradb # Rename the folder
    cd defradb/cli/defradb
    go install
    ```
## Getting Stated

### Before You Begin

Before installing DefraDB, review the following pre-requisites.

- Install DefraDB Command Line Interface (`defradb cli`) locally or in an accessible remote node.
- Install GraphQL client (e.g. GraphiQL). See download [link](https://www.electronjs.org/apps/graphiql).

### SetUp

Set up a DefraDB node with this command in the terminal:
- `defradb start`

This action prompts the following items:
- Starts a node with default settings (running at [http://localhost:9181/](http://localhost:9181/))
- Creates a configuration file at $HOME/.defra/config.yaml, which is the user home directory

DefraDB supports two storage engines:
- BadgerDB (used by default, provides disk-backed persistent storage)
- In-memory store

To choose a storage type you can
- use `--store` option with the start command, or
- edit the local config file

:::note

If you are using BadgerDB, and you get an error message:
- `Failed to initiate database:Map log file. Path=.defradb/data/000000.vlog. Error=exec format error`

It means that the terminal client does not support Mmap'ed files. This is common with older version of Ubuntu on Windows, Windows SubSystem for Linux (WSL). Unfortunately, BadgerDB uses Mmap to interact with the filesystem, so you will need to use a terminal client which supports it.

:::

After the local environment is successfully setup, test your connection with:
- `defradb client ping` for a `Success!` response. Once you've confirmed your node is running correctly, then make sure you set the GraphQL Endpoint to http://localhost:9181/graphql and the method to GET. This is assuming that you are using GraphiQL client to interact with the database.

### Adding a Schema Type

To add a new schema type to the database, you can write the schema to a local file using the GraphQL SDL format, and submit that to the database. See example below.

- **Step 1**: Add to users.gql file

```gql
type user 
{
	name: String 
	age: Int 
	verified: Boolean 
	points: Float
}
```
- **Step 2**: Run the following command:

```gql
defradb client schema add -f users.gql
```

This registers the type, builds a dedicated collection, and generates the typed GraphQL endpoints for querying and mutation. More examples of schema type definitions are available in the [cli/defradb/examples](https://github.com/sourcenetwork/defradb/blob/master/cli/defradb/examples) folder.

### Query Documents

Once your local node is populated with data, you can query it.

```gql
query {
  user {
    _key
    age
    name
    points
  }
}
```
This will query all the users, and return the fields _key, age, name, and points. GraphQL queries only return the exact fields you request. There is no * selector unlike SQL.

You can further filter our results by adding a filter argument to the query.

```gql
query {
  user(filter: {points: {_ge: 50}}) {
    _key
    age
    name
    points
  }
}
```

This will only return user documents which have a value for the points field Greater Than or Equal to ( _ge ) 50.

To see all the available query options, types, and functions please see the [Query Documentation](https://github.com/sourcenetwork/defradb#query-documenation).

### Interact with Document Commits

Internally, DefraDB uses MerkleCRDTs to store data. MerkleCRDTs convert all mutations and updates a document has into a graph of changes; similar to Git. Moreover, the graph is a [MerkleDAG](https://docs.ipfs.io/concepts/merkle-dag/), which means all nodes are content identifiable with CIDs, and each node, references its parents CIDs.

To get the most recent commit in the MerkleDAG for a with a docKey of `bae-91171025-ed21-50e3-b0dc-e31bccdfa1ab`, you can submit the following query:

```gql
query {
  latestCommits(dockey: "bae-91171025-ed21-50e3-b0dc-e31bccdfa1ab") {
    cid
    delta
    height
    links {
      cid
      name
    }
  }
}
```
This will return a structure similar to the following, which contains the update payload that caused this new commit (delta), and any sub graph commits this references.

```json
{
  "data": [
    {
      "cid": "QmPqCtcCPNHoWkHLFvG4aKqDkLLzhVDAVEDSzEs38GHxoo",
      "delta": "pGNhZ2UYH2RuYW1lY0JvYmZwb2ludHMYWmh2ZXJpZmllZPU=",
      "height": 1,
      "links": [
        {
          "cid": "QmSom35RYVzYTE7nGsudvomv1pi9ffjEfSFsPZgQRM92v1",
          "name": "age"
        },
        {
          "cid": "QmYJrCcfMmfFp4JcbChLfMLCv8TSHjGwRVHUBgPazWxPga",
          "name": "name"
        },
        {
          "cid": "QmXLuVB5CCGqWcdQitingkfRxoVRLKh2jNcnX4UbYnW6Mk",
          "name": "points"
        },
        {
          "cid": "QmNRQwWjTBTDfAFUHkG8yuKmtbprYQtGs4jYxGJ5fCfXtn",
          "name": "verified"
        }
      ]
    }
  ]
}
```

Additionally, you can get *all* commits in a document MerkleDAG with `allCommits`, and lastly, you can get a specific commit, identified by a `cid` with the `commit` query, like so:

```gql
query {
  commit(cid: "QmPqCtcCPNHoWkHLFvG4aKqDkLLzhVDAVEDSzEs38GHxoo") {
    cid
    delta
    height
    links {
      cid
      name
    }
  }
}
```
Here, you can see you use the CID from the previous query to further explore the related nodes in the MerkleDAG.

This only scratches the surface of the DefraDB Query Language, see below for the entire language specification.

## Query Documentation

Access the official DefraDB Query Language Docs [add new link] 

## CLI Documentation
You can find generated documentation for the shipped CLI interface [here](https://github.com/sourcenetwork/defradb/blob/master/docs/cmd/defradb.md)

## Next Steps

The current early access release has much of the digial signatute, and identity work removed, until the cryptographic elements can be finalized.

The following will ship with the next release:

- schema type mutation/migration
- data syncronization between nodes
- grouping and aggregation on the query language
- additional CRDT type(s)

We will release a project board outlining the planned, and completed features of our roadmap.

## Licensing

Current DefraDB code is released under a combination of two licenses, the [Business Source License (BSL)](https://github.com/sourcenetwork/defradb/blob/master/licenses/BSL.txt) and the [DefraDB Community License (DCL)](https://github.com/sourcenetwork/defradb/blob/master/licenses/DCL.txt).

When contributing to a DefraDB feature, you can find the relevant license in the comments at the top of each file.

## Further Reading

to be updated
