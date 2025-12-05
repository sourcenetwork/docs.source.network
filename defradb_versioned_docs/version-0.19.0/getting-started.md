---
sidebar_position: 1
title: Getting Started
slug: /
---

# DefraDB Overview

![DefraDB Overview](/img/defradb-cover.png)

DefraDB is an application-centric database that prioritizes data ownership, personal privacy, and information security. Its data model, powered by the convergence of [MerkleCRDTs](https://arxiv.org/pdf/2004.00107.pdf) and the content-addressability of [IPLD](https://docs.ipld.io/), enables a multi-write-master architecture. It features [DQL](./references/query-specification/query-language-overview.md), a query language compatible with GraphQL but providing extra convenience. By leveraging peer-to-peer infrastructure, it can be deployed nimbly in novel topologies. Access control is determined by a relationship-based DSL, supporting document or field-level policies, secured by the SourceHub infrastructure. DefraDB is a core part of the [Source technologies](https://source.network/) that enable new paradigms of local-first software, edge compute, access-control management, application-centric features, data trustworthiness, and much more.

Disclaimer: At this early stage, DefraDB does not offer data encryption, and the default configuration exposes the database to the infrastructure. The software is provided "as is" and is not guaranteed to be stable, secure, or error-free. We encourage you to experiment with DefraDB and provide feedback, but please do not use it for production purposes until it has been thoroughly tested and developed.

## Install

Install `defradb` by [downloading an executable](https://github.com/sourcenetwork/defradb/releases) or building it locally using the [Go toolchain](https://golang.org/):

```bash
git clone https://github.com/sourcenetwork/defradb.git
cd defradb
make install
```

Ensure `defradb` is included in your `PATH`:

```bash
export PATH=$PATH:$(go env GOPATH)/bin
```

We recommend experimenting with queries using a native GraphQL client. [GraphiQL](https://altairgraphql.dev/#download) is a popular option.

## Key Management - Initial Setup

DefraDB has a built-in keyring for storing private keys securely. Keys are loaded at startup, and <b>a secret must be provided via the `DEFRA_KEYRING_SECRET` environment variable</b>. The following keys are loaded from the keyring on start:

- `peer-key` Ed25519 private key (required)
- `encryption-key` AES-128, AES-192, or AES-256 key (optional)
- `node-identity-key` Secp256k1 private key (optional). This key is used for node's identity.

If a `.env` file is available in the working directory, the secret can be stored there or via a file at a path defined by the `--secret-file` flag.

Keys will be randomly generated on the initial start of the node if they are not found. To generate keys:

```bash
export DEFRA_KEYRING_SECRET=<make_a_password>
defradb keyring generate
```

Import external keys:

```bash
defradb keyring import <name> <private-key-hex>
```

To learn more about the available options:

```bash
defradb keyring --help
```

NOTE: Node identity is an identity assigned to the node. It is used to exchange encryption keys with other nodes.

## Start

Start a node by executing:

```bash
defradb start
```

Verify the local connection:

```bash
defradb client collection describe
```

## Configuration

DefraDB uses a default configuration:

- Data directory: `~/.defradb/`
- GraphQL endpoint: `http://localhost:9181/api/v0/graphql`

The `client` command interacts with the locally running node.

The GraphQL endpoint can be used with a GraphQL client (e.g., Altair) to conveniently perform requests (`query`, `mutation`) and obtain schema introspection.  Read more about [configuration options](./references/config.md).

## Add a schema type

Define and add a schema type.

```bash
defradb client schema add '
  type User {
    name: String 
    age: Int 
    verified: Boolean 
    points: Float
  }
'
```

For more examples of schema type definitions, see the [examples/schema/](examples/schema/) folder.

## Create documents

Submit a `mutation` request to create documents of the `User` type:

```bash
defradb client query '
  mutation {
      user1: create_User(input: {age: 31, verified: true, points: 90, name: "Bob"}) {
          _docID
      }
      user2: create_User(input: {age: 28, verified: false, points: 15, name: "Alice"}) {
          _docID
      }
      user3: create_User(input: {age: 35, verified: true, points: 100, name: "Charlie"}) {
          _docID
      }
  }
'
```

Expected response (_docID will be different):

```json
{
  "data": {
    "user1": [
      {
        "_docID": "bae-206bdf93-9364-5252-a227-17d827eed50c"
      }
    ],
    "user2": [
      {
        "_docID": "bae-457f5b48-29b7-5084-8e00-837aca8ffb55"
      }
    ],
    "user3": [
      {
        "_docID": "bae-18f3fc7f-530f-5cab-a149-e9efb7e718ef"
      }
    ]
  }
}
```

`_docID` is the document's unique identifier determined by its schema and initial data.

## Query documents

Once you have populated your node with data, you can query it:

```bash
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

This query obtains *all* users and returns their fields `_docID, age, name, points`. GraphQL queries only return the exact fields requested.

You can further filter results with the `filter` argument.

```bash
defradb client query '
  query {
    User(filter: {points: {_ge: 50}}) {
      _docID
      age
      name
      points
    }
  }
'
```

This returns only user documents which have a value for the `points` field *Greater Than or Equal to* (`_ge`) 50.

## Obtain document commits

DefraDB's data model is based on [MerkleCRDTs](https://arxiv.org/pdf/2004.00107.pdf). Each document has a graph of all of its updates, similar to Git. The updates are called `commit`s and are identified by `cid`, a content identifier. Each references its parents by their `cid`s. First let's store the docID of the first User in a shell variable:

```bash
FIRST_DOC_ID=$(defradb client query '
  query {
    User(filter: {points: {_ge: 50}}) {
      _docID
      age
      name
      points
    }
  }
' | jq -r '.data.User[0]._docID')

echo "The first _docID is: $FIRST_DOC_ID"
```

Then to get the most recent commit in the MerkleDAG for this document:

```bash
defradb client query "
  query {
    _latestCommits(docID: \"$FIRST_DOC_ID\") {
      cid
      delta
      height
      links {
        cid
        name
      }
    }
  }
"
```

It returns a structure similar to the following, which contains the update payload that caused this new commit (`delta`) and any subgraph commits it references.

```json
{
  "data": {
    "latestCommits": [
      {
        "cid": "bafybeifhtfs6vgu7cwbhkojneh7gghwwinh5xzmf7nqkqqdebw5rqino7u",
        "delta": "pGNhZ2UYH2RuYW1lY0JvYmZwb2ludHMYWmh2ZXJpZmllZPU=",
        "height": 1,
        "links": [
          {
            "cid": "bafybeiet6foxcipesjurdqi4zpsgsiok5znqgw4oa5poef6qtiby5hlpzy",
            "name": "age"
          },
          {
            "cid": "bafybeielahxy3r3ulykwoi5qalvkluojta4jlg6eyxvt7lbon3yd6ignby",
            "name": "name"
          },
          {
            "cid": "bafybeia3tkpz52s3nx4uqadbm7t5tir6gagkvjkgipmxs2xcyzlkf4y4dm",
            "name": "points"
          },
          {
            "cid": "bafybeia4off4javopmxcdyvr6fgb5clo7m5bblxic5sqr2vd52s6khyksm",
            "name": "verified"
          }
        ]
      }
    ]
  }
}
```

Now let's obtain a specific commit by its content identifier (`cid`). First let's store the cid of the selected user in a shell variable:

```bash
FIRST_CID=$(defradb client query "
  query {
    _latestCommits(docID: \"$FIRST_DOC_ID\") {
      cid
      delta
      height
      links {
        cid
        name
      }
    }
  }
" | jq -r '.data._latestCommits[0].cid')

echo "The first CID is: $FIRST_CID"
```
to obtain the specific commit from this content identifier:

```bash
defradb client query "
  query {
    _commits(cid:\"$FIRST_CID\") {
      cid
      delta
      height
      links {
        cid
        name
      }
    }
  }
"
```

## DefraDB Query Language (DQL)

DQL is compatible with GraphQL but features various extensions.

Read its documentation [here](./references/query-specification/query-language-overview.md) to discover its filtering, ordering, limiting, relationships, variables, aggregate functions, and other useful features.

## Peer-to-peer data synchronization

DefraDB leverages peer-to-peer networking for data exchange, synchronization, and replication of documents and commits.

When starting a node for the first time, a key pair is generated and stored in its "root directory" (`~/.defradb/` by default).

Each node has a unique `PeerID` generated from its public key. This ID allows other nodes to connect to it.

To view your node's peer info:

```bash
defradb client p2p info
```

There are two types of peer-to-peer relationships supported: **pubsub** peering and **replicator** peering.

Pubsub peering *passively* synchronizes data between nodes by broadcasting *Document Commit* updates to the topic of the commit's document key. Nodes need to be listening on the pubsub channel to receive updates. This is for when two nodes *already* have shared a document and want to keep them in sync.

Replicator peering *actively* pushes changes from a specific collection *to* a target peer.

<details>
<summary>Pubsub example</summary>

Pubsub peers can be specified on the command line using the `--peers` flag, which accepts a comma-separated list of peer [multiaddresses](https://docs.libp2p.io/concepts/addressing/). For example, a node at IP `192.168.1.12` listening on 9000 with PeerID `12D3KooWNXm3dmrwCYSxGoRUyZstaKYiHPdt8uZH5vgVaEJyzU8B` would be referred to using the multiaddress `/ip4/192.168.1.12/tcp/9000/p2p/12D3KooWNXm3dmrwCYSxGoRUyZstaKYiHPdt8uZH5vgVaEJyzU8B`.

Let's go through an example of two nodes (*nodeA* and *nodeB*) connecting with each other over pubsub, on the same machine.

In the first terminal, start *nodeA* with a default configuration:

```bash
export DEFRA_KEYRING_SECRET=<make_a_password>
defradb start
```

In a second terminal, obtain the node's peer info and save the ID:

```bash
PEER_ID=$(defradb client p2p info 2>/dev/null | grep -oE '12D3[a-zA-Z0-9]+')
echo $PEER_ID
```

In this second terminal, start *nodeB*, configured to connect with *nodeA*:

```bash
export DEFRA_KEYRING_SECRET=<make_a_password_for_node_B>
defradb start --rootdir ~/.defradb-nodeB --url localhost:9182 --p2paddr /ip4/127.0.0.1/tcp/9172 --peers /ip4/127.0.0.1/tcp/9171/p2p/$PEER_ID
```

About the flags:

- `--rootdir` specifies the root dir (config and data) to use
- `--url` is the address to listen on for the client HTTP and GraphQL API
- `--p2paddr` is a comma-separated list of multiaddresses to listen on for p2p networking
- `--peers` is a comma-separated list of peer multiaddresses

This starts two nodes and connects them via pubsub networking.
</details>

<details>
<summary>Subscription example</summary>

It is possible to subscribe to updates on a given collection by using its Name as the pubsub topic. To see the available collections, run the following command:

```bash
defradb client collection describe
```

Nodes need to know the collection schema before they can subscribe to updates. Add the User collection schema to *nodeB* with this command:

```bash
defradb client schema add --url localhost:9182 '
  type User {
    name: String
    age: Int
    verified: Boolean
    points: Float
  }
'
```

 After setting up 2 nodes as shown in the [Pubsub example](#pubsub-example) section, we can subscribe to collections updates on *nodeA* from *nodeB* by using the following command:

```bash
defradb client p2p collection add --url localhost:9182 User
```

Multiple collections can be added at once.

```bash
defradb client p2p collection add --url localhost:9182 <collection1Name>,<collection2Name>,<collection3Name>
```

Now let's add a new user to *nodeA*.

```bash
defradb client query '
  mutation {
      create_User(input: {age: 22, verified: true, points: 5, name: "Zara"}) {         
          _docID
      }
  }
'
```

You can now see this data published from *nodeA* to *nodeB*.

```bash
defradb client query --url localhost:9182 '
  query { User { name age verified points } }
'
```

This should return the following:

```json
------ Request Results ------
{
  "data": {
    "User": [
      {
        "age": 22,
        "name": "Zara",
        "points": 5,
        "verified": true
      }
    ]
  }
}
```

Note that *nodeB* is **passively** synchronizing with *nodeA*. *nodeB* will only receive new updates to the User collection. The previous users we setup on *nodeA* won't sync with *nodeB* unless we setup Replicator peering.
</details>

<details>
<summary>Replicator example</summary>

Replicator peering is targeted: it allows a node to actively send updates to another node. Let's go through an example of *nodeA* actively replicating to *nodeB*:

Start *nodeA*:

```bash
defradb start
```

In another terminal, add this example schema to it:

```bash
defradb client schema add '
  type Article {
    content: String
    published: Boolean
  }
'
```

Start (or continue running from above) *nodeB*, that will be receiving updates:

```bash
defradb start --rootdir ~/.defradb-nodeB --url localhost:9182 --p2paddr /ip4/0.0.0.0/tcp/9172
```

Here we *do not* specify `--peers` as we will manually define a replicator after startup via the `rpc` client command.

In another terminal, add the same schema to *nodeB*:

```bash
defradb client schema add --url localhost:9182 '
  type Article {
    content: String
    published: Boolean
  }
'
```

Now add some data entries to *nodeA*.

```bash
defradb client query '                                
  mutation {
      article1: create_Article(input: {content: "hello", published: true}) {
          _docID
      }
      article2: create_Article(input: {content: "world", published: false}) {
          _docID
      }
  }
'
```

Then copy the peer info from *nodeB* and set *nodeA* to actively replicate the Article collection to *nodeB*:

```bash
NODE_B_PEER_INFO=$(defradb client p2p info --url localhost:9182 2>/dev/null | grep -oE '"/ip4/127\.0\.0\.1/tcp/[^"]+' | tr -d '"')
echo $NODE_B_PEER_INFO
defradb client p2p replicator set -c Article $NODE_B_PEER_INFO
```

Now all documents in the Article collection on *nodeA* will be actively pushed to *nodeB*. Verify this with the following command:

```bash
defradb client query --url localhost:9182 ' 
  query { Article { content published } }
'
```
You should see the following returned:

```json
------ Request Results ------
{
  "data": {
    "Article": [
      {
        "content": "world",
        "published": false
      },
      {
        "content": "hello",
        "published": true
      }
    ]
  }
}
```

All future documents in the Article collection added to *nodeA* will be actively pushed to *nodeB*.
</details>

## Securing the HTTP API with TLS

By default, DefraDB will expose its HTTP API at `http://localhost:9181/api/v0`. It's also possible to configure the API to use TLS with self-signed certificates or Let's Encrypt.

To start defradb with self-signed certificates placed under `~/.defradb/certs/` with `server.key`
being the public key and `server.crt` being the private key, just do:

```bash
defradb start --tls
```

The keys can be generated with your generator of choice or with `make tls-certs`.

Since the keys should be stored within the DefraDB data and configuration directory, the recommended key generation command is `make tls-certs path="~/.defradb/certs"`.

If not saved under `~/.defradb/certs` then the public (`pubkeypath`) and private (`privkeypaths`) key paths need to be explicitly defined in addition to the `--tls` flag or `tls` set to `true` in the config.

Then to start the server with TLS, using your generated keys in custom path:

```bash
defradb start --tls --pubkeypath ~/path-to-pubkey.key --privkeypath ~/path-to-privkey.crt

```

## Access Control System

Read more about the access control [here](./references/acp.md).

## Supporting CORS

When accessing DefraDB through a frontend interface, you may be confronted with a CORS error. That is because, by default, DefraDB will not have any allowed origins set. To specify which origins should be allowed to access your DefraDB endpoint, you can specify them when starting the database:

```bash
defradb start --allowed-origins=https://yourdomain.com
```

If running a frontend app locally on localhost, allowed origins must be set with the port of the app:

```bash
defradb start --allowed-origins=http://localhost:3000
```

The catch-all `*` is also a valid origin.

## External port binding

By default the HTTP API and P2P network will use localhost. If you want to expose the ports externally you need to specify the addresses in the config or command line parameters.

```bash
defradb start --p2paddr /ip4/0.0.0.0/tcp/9171 --url 0.0.0.0:9181
```

## Backing up and restoring

It is currently not possible to do a full backup of DefraDB that includes the history of changes through the Merkle DAG. However, DefraDB currently supports a simple backup of the current data state in JSON format that can be used to seed a database or help with transitioning from one DefraDB version to another.

To backup the data, run the following command:

```bash
defradb client backup export path/to/backup.json
```

To pretty print the JSON content when exporting, run the following command:

```bash
defradb client backup export --pretty path/to/backup.json
```

To restore the data, run the following command:

```bash
defradb client backup import path/to/backup.json
```

## Conclusion

This gets you started to use DefraDB. Read on the documentation website for guides and further information.
