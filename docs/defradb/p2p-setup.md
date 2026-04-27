---
title: Peer-to-peer synchronization
---

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
