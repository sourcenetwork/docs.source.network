---
sidebar_position: 1
title: Getting Started
slug: /
---

# DefraDB Overview

![DefraDB Overview](/img/defradb-cover.png)

DefraDB is an application-centric database that prioritizes data ownership, personal privacy, and information security. Its data model, powered by the convergence of [MerkleCRDTs](https://arxiv.org/pdf/2004.00107.pdf) and the content-addressability of [IPLD](https://docs.ipld.io/), enables a multi-write-master architecture. It features [DQL](/references/query-specification/query-language-overview.md), a query language compatible with GraphQL but providing extra convenience. By leveraging peer-to-peer infrastructure, it can be deployed nimbly in novel topologies. Access control is determined by a relationship-based DSL, supporting document or field-level policies, secured by the SourceHub infrastructure. DefraDB is a core part of the [Source technologies](https://source.network/) that enable new paradigms of local-first software, edge compute, access-control management, application-centric features, data trustworthiness, and much more.

:::info

At this early stage, DefraDB does not offer data encryption, and the default configuration exposes the database to the infrastructure. The software is provided "as is" and is not guaranteed to be stable, secure, or error-free. We encourage you to experiment with DefraDB and provide feedback, but please do not use it for production purposes until it has been thoroughly tested and developed.

:::

## Install

Install `defradb` by [downloading an executable](https://github.com/sourcenetwork/defradb/releases) or building it locally using the [Go toolchain](https://golang.org/):

```shell
git clone https://github.com/sourcenetwork/defradb.git
cd defradb
make install
```

This will produce a `defradb` binary in your [Go workspace](https://go.dev/wiki/SettingGOPATH). To be able to run `defradb` commands, ensure `$GOPATH/bin` is included in your `PATH`:

```shell
export PATH=$PATH:$(go env GOPATH)/bin
```

:::tip

For prototyping, you can also run DefraDB in a Docker container:

```shell
docker run \
  -e DEFRA_KEYRING_SECRET=secret \
  -p 9181:9181 \
  ghcr.io/sourcenetwork/defradb:1.0.0-rc1 \
  start --url 0.0.0.0:9181
```

:::


### Initial keys setup

DefraDB provides a keyring for storing private keys securely. The following keys are loaded from the keyring on start:

- `peer-key` -- ed25519 key (required)
- `encryption-key` -- AES-128, AES-192, or AES-256 key (optional)
- `node-identity-key` -- secp256k1 or ed25519 key (optional; type defined by [`datastore.defaultkeytype`](/references/config.md#datastoredefaultkeytype)). If not found, it will be randomly generated when a node is started. This key establishes the node's identity, and is used to exchange encryption keys with other nodes.

You generate keys via the [`keyring new` command](/references/cli/defradb_keyring_new.md). By default, keys are stored in the `defradb` keyring under the secret `secret`. You can initialize the keyring with a different secret via the `DEFRA_KEYRING_SECRET` environment variable, via a `.env` file located in the working directory, or via a file at a path defined by the `--secret-file` flag. **You will need to provide the secret every time you start the node.**

```shell
DEFRA_KEYRING_SECRET=<secret> defradb keyring new
```

Instead of generating new keys, you can also import external keys:

```shell
defradb keyring add <name> <private-key-hex>
```

### Start

To start a node,

```shell
DEFRA_KEYRING_SECRET=<secret> defradb start
```

To experiment with queries, you can use either the playground at `http://localhost:9181`, or a native GraphQL client ([Altair](https://altairgraphql.dev/#download) is a popular option). DefraDB's GraphQL endpoint is at `http://localhost:9181/api/v1/graphql` (the versionless endpoint `http://localhost:9181/api/graphql` always points to the latest version).

The [`client` CLI command](/references/cli/defradb_client.md) interacts with the locally running node.

DefraDB's root directory is located at `~/.defradb/`. Among other things, it contains the [configuration file](/references/config.md).

To verify the local connection to the node works, view collections from another terminal:

```shell
defradb client collection describe
```

## Add a collection

Collections are the _types_ into which documents fit.

To begin, add a collection:

```shell
defradb client collection add '
  type User {
    name: String
    age: Int
    verified: Boolean
    points: Float
  }
'
```

For more examples of collection definitions, see the [defradb -> examples/schema/](https://github.com/sourcenetwork/defradb/tree/develop/examples/collection) folder.

## Create documents

Submit a `mutation` request to create documents of the `User` type:

```shell
defradb client query '
  mutation {
      user1: add_User(input: {age: 31, verified: true, points: 90, name: "Bob"}) {
          _docID
      }
      user2: add_User(input: {age: 28, verified: false, points: 15, name: "Alice"}) {
          _docID
      }
      user3: add_User(input: {age: 35, verified: true, points: 100, name: "Charlie"}) {
          _docID
      }
  }
'
```

Expected response:

```json
{
  "data": {
    "user1": [
      {
        "_docID": "bae-fb9f4d0d-ccad-52d3-bd2e-6b0e5e4612e7"
      }
    ],
    "user2": [
      {
        "_docID": "bae-fdbdd3b5-31d4-51f9-afba-b9d5aacaf210"
      }
    ],
    "user3": [
      {
        "_docID": "bae-bf8fde7c-3344-5c48-818a-2747f0f76c07"
      }
    ]
  }
}
```

`_docID` is the document's unique identifier determined by the collection it belongs to and the data it is initialized with.

## Query documents

Once you have populated your node with data, you can query it:

```shell
defradb client query '
  query {
    User {
      _docID
      age
      name
      points
    }
  }
'
```

This query obtains *all* users and returns their fields `_docID, age, name, points`. GraphQL queries only return the exact fields requested (there is no equivalent of the SQL `SELECT *` syntax).

You can further filter results with the `filter` argument.

```shell
defradb client query '
  query {
    User(filter: {points: {_geq: 50}}) {
      _docID
      age
      name
      points
    }
  }
'
```

This returns only user documents which have a value for the `points` field *Greater Than or Equal to* (`_geq`) 50.

## Obtain document commits

DefraDB's data model is based on [MerkleCRDTs](https://arxiv.org/pdf/2004.00107.pdf). Each document has a graph of all of its updates, similar to Git. The updates are called `commit`s and are identified by `cid`s (content identifiers). Each commit references its parents by their `cid`s.

To look at the commits for the first `User` document, let's store its docID in a shell variable:

```shell
FIRST_DOC_ID=$(defradb client query '
  query {
    User(filter: {points: {_geq: 50}}) {
      _docID
      age
      name
      points
    }
  }
' | jq -r '.data.User[0]._docID')

echo "The first _docID is: $FIRST_DOC_ID"
```

To get the most recent commit in the MerkleDAG for this document:

```shell
defradb client query "
  query {
    _commits(docID: \"$FIRST_DOC_ID\") {
      cid
      delta
      height
      links {
        cid
        fieldName
      }
    }
  }
"
```

The list of commits shows, for each,

* `cid` -- The unique identifier
* `delta` -- The base64-encoded content (the commit's payload)
* `height` -- The height of the Merkle DAG at that specific node
* `links` -- Any connection to other entities (`links`)

```json
{
  "data": {
    "_commits": [
      {
        "cid": "bafybeifhtfs6vgu7cwbhkojneh7gghwwinh5xzmf7nqkqqdebw5rqino7u",
        "delta": "pGNhZ2UYH2RuYW1lY0JvYmZwb2ludHMYWmh2ZXJpZmllZPU=",
        "height": 1,
        "links": [
          {
            "cid": "bafybeiet6foxcipesjurdqi4zpsgsiok5znqgw4oa5poef6qtiby5hlpzy",
            "fieldName": "age"
          },
          {
            "cid": "bafybeielahxy3r3ulykwoi5qalvkluojta4jlg6eyxvt7lbon3yd6ignby",
            "fieldName": "name"
          },
          {
            "cid": "bafybeia3tkpz52s3nx4uqadbm7t5tir6gagkvjkgipmxs2xcyzlkf4y4dm",
            "fieldName": "points"
          },
          {
            "cid": "bafybeia4off4javopmxcdyvr6fgb5clo7m5bblxic5sqr2vd52s6khyksm",
            "fieldName": "verified"
          }
        ]
      }
    ]
  }
}
```

You can also obtain a specific commit by its content identifier (`cid`). First let's store the `cid` of the selected user in a shell variable:

```shell
FIRST_CID=$(defradb client query "
  query {
    _commits(docID: \"$FIRST_DOC_ID\") {
      cid
      delta
      height
      links {
        cid
        fieldName
      }
    }
  }
" | jq -r '.data._commits[0].cid')

echo "The first CID is: $FIRST_CID"
```
to obtain the specific commit from this content identifier:

```shell
defradb client query "
  query {
    _commits(cid:\"$FIRST_CID\") {
      cid
      delta
      height
      links {
        cid
        fieldName
      }
    }
  }
"
```

## DefraDB Query Language (DQL)

DQL is compatible with GraphQL but features various extensions.

[DefraDB Query Language's documentation](/references/query-specification/query-language-overview.md) shows its filtering, ordering, limiting, relationships, variables, aggregate functions, and other useful features.

## Peer-to-peer data synchronization

DefraDB uses peer-to-peer networking for data exchange, synchronization, and replication of documents and commits.

When a node is started for the first time, a key pair is generated and stored in its root directory (`~/.defradb/` by default).

Each node has a unique `PeerID` generated from its public key. This ID allows other nodes to connect to it.

To view your node's peer info:

```shell
defradb client p2p info
```

Two types of peer-to-peer relationships are supported: **pubsub** and **replicator**.

- Pubsub peering -- *Passively* synchronizes data between nodes by broadcasting document commit updates to the topic of the collection name. Nodes need to set up a shared collection and to be listening on the pubsub channel to receive updates and keep their documents in sync.
- Replicator peering -- *Actively* pushes changes from a specific collection to a target peer.

<details>
<summary>Pubsub example</summary>

Pubsub peers can be specified on the command line using the `--peers` flag, which accepts a comma-separated list of peer [multiaddresses](https://docs.libp2p.io/concepts/addressing/). For example, a node at IP `192.168.1.12` listening on 9000 with PeerID `12D3KooWNXm3dmrwCYSxGoRUyZstaKYiHPdt8uZH5vgVaEJyzU8B` would be referred to using the multiaddress `/ip4/192.168.1.12/tcp/9000/p2p/12D3KooWNXm3dmrwCYSxGoRUyZstaKYiHPdt8uZH5vgVaEJyzU8B`.

Let's go through an example of two nodes (*nodeA* and *nodeB*) connecting with each other over pubsub, on the same machine.

Start *nodeA* with a default configuration:

```shell
defradb start
```

Obtain the node's peer info:

```shell
defradb client p2p info
```

In this example, we use `12D3KooWNXm3dmrwCYSxGoRUyZstaKYiHPdt8uZH5vgVaEJyzU8B`, but locally it will be different.

For *nodeB*, provide the following configuration:

```shell
defradb start --rootdir ~/.defradb-nodeB --url localhost:9182 --p2paddr /ip4/0.0.0.0/tcp/9172 --peers /ip4/127.0.0.1/tcp/9171/p2p/12D3KooWNXm3dmrwCYSxGoRUyZstaKYiHPdt8uZH5vgVaEJyzU8B
```

About the flags:

- `--rootdir` specifies the root dir (config and data) to use
- `--url` is the address to listen on for the client HTTP and GraphQL API
- `--p2paddr` is a comma-separated list of multiaddresses to listen on for p2p networking
- `--peers` is a comma-separated list of peer multiaddresses

This starts two nodes and connects them via pubsub networking.

To subscribe to updates on a collection, provide its name as the pubsub topic. To subscribe to collections updates on *nodeA* from *nodeB*, use [defradb client p2p collection add](/references/cli/defradb_client_p2p_collection_add.md):

```shell
defradb client p2p collection add User --url localhost:9182 bafkreibpnvkvjqvg4skzlijka5xe63zeu74ivcjwd76q7yi65jdhwqhske
```

You can add multiple collection names at once:

```shell
defradb client p2p collection add <ID1>,<ID2>,<ID3> --url localhost:9182
```

</details>

<details>
<summary>Replicator example</summary>

Replicator peering is _targeted_: it allows a node to actively send updates to another node. Let's go through an example of *nodeA* actively replicating to *nodeB*:

Start *nodeA*:

```shell
defradb start
```

Create a new collection `Article`:

```shell
defradb client collection add '
  type Article {
    content: String
    published: Boolean
  }
'
```

Start *nodeB*, which will be receiving updates:

```shell
defradb start --rootdir ~/.defradb-nodeB --url localhost:9182 --p2paddr /ip4/0.0.0.0/tcp/9172
```

:::note

We *do not* specify `--peers` as we will manually define a replicator after startup via the `client p2p replicator` command.

:::

Add the same collection to *nodeB*:

```shell
defradb client collection add --url localhost:9182 '
  type Article {
    content: String
    published: Boolean
  }
'
```

Then copy the peer info from *nodeB*:

```shell
defradb client p2p info --url localhost:9182
```

Set *nodeA* to actively replicate the Article collection to *nodeB*:

```shell
defradb client p2p replicator add -c Article /ip4/0.0.0.0/tcp/9172/p2p/<nodeB-peerID>
```

As you add or update documents in the `Article` collection on *nodeA*, they will be pushed to *nodeB*.

:::info

Changes to *nodeB* will still be passively published back to *nodeA* via pubsub.

:::

</details>

## Secure the HTTP API with TLS

The HTTP API is exposed unencrypted by default, but you can configure it to use TLS.

Although keys can be located in any directory, the default location is `~/.defradb/certs`. To enable TLS, start the instance providing the paths to the public (`pubkeypath`) and private (`privkeypath`) keys:

```shell
defradb start --pubkeypath ~/.defradb/certs/pubkey.crt --privkeypath ~/.defradb/certs/privkey.key
```

:::tip

To generate a *self-signed* certificate,

```shell
openssl ecparam -genkey -name secp384r1 -out ~/.defradb/certs/privkey.key
openssl req -new -x509 -sha256 -key ~/.defradb/certs/privkey.key -out ~/.defradb/certs/pubkey.crt -days 365
```

:::


## Support CORS

When accessing DefraDB through a frontend interface, you may be confronted with a CORS error. That is because, by default, DefraDB will not have any allowed origins set. To specify which origins should be allowed to access your DefraDB endpoint, specify them when starting the database:

```shell
defradb start --allowed-origins=https://yourdomain.com
```

If running a frontend app locally on localhost, allowed origins must be set with the port of the app:

```shell
defradb start --allowed-origins=http://localhost:3000
```

:::info

The catch-all `*` is also a valid origin.

:::

## External port binding

By default, the HTTP API and P2P network use localhost. If you want to expose the ports externally, you need to specify the addresses in the config or command line parameters:

```shell
defradb start --p2paddr /ip4/0.0.0.0/tcp/9171 --url 0.0.0.0:9181
```

## Backup and restore

It is currently not possible to do a full backup of DefraDB that includes the history of changes through the Merkle DAG. However, DefraDB supports a simple backup of the data state in JSON format that can be used to seed a database or help with transitioning from one DefraDB version to another.

To backup the data, run the following command:

```shell
defradb client backup export path/to/backup.json
```

To pretty print the JSON content when exporting, run the following command:

```shell
defradb client backup export --pretty path/to/backup.json
```

To restore the data, run the following command:

```shell
defradb client backup import path/to/backup.json
```
