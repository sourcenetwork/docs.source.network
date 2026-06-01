---
title: Replicator
---

With a [publisher-subscriber setup](pub-sub.md), a node subscribes to updates broadcasted by other nodes. It is the recipients who decide to be part of the community and keep in sync with the collection's shared state. 

With a replicator peering, a node sends updates for a selected collection to another node. One node decides to impose its will onto another.

### Create a common collection {/* #create-collection */}

Both peers must know about the collection they are going to send/receive updates about. The collection must have the same fields across both peers.

```shell title='Create the "User" collection on Node1'
defradb client collection add '
  type User {
    name: String
    age: Int
    verified: Boolean
    points: Float
  }
' --url localhost:9181
```

```shell title='Create the "User" collection on Node2'
defradb client collection add '
  type User {
    name: String
    age: Int
    verified: Boolean
    points: Float
  }
' --url localhost:9182
```

## Set up replication {/* #setup */}

Start by retrieving the peer info for the target node.
In this example, Node1 will send updates to Node2.

```shell title="Get peer info for Node2"
defradb client p2p info --url localhost:9182
```

```json title="Output"
[
  "/ip4/127.0.0.1/tcp/9172/p2p/12D3KooWHwpvkxhfFtX7kPZSj9XJ5wvgitqZ5mt2uWVpV5kkzQX4"
]
```

To set Node1 to replicate the `User` collection to Node2, use the CLI command [`defradb client p2p replicator add`](/references/cli/defradb_client_p2p_replicator_add.md), providing the collection name and the peer address:

```shell
defradb client p2p replicator add -c User /ip4/127.0.0.1/tcp/9172/p2p/12D3KooWHwpvkxhfFtX7kPZSj9XJ5wvgitqZ5mt2uWVpV5kkzQX4 --url localhost:9181
```

Updates submitted to Node1 will be propagated to Node2 as soon as Node2 is online. When the replication is set up for the first time, documents present on Node1 but not on Node2 will be propagated to Node2. Updates submitted to Node2 remain local to Node2 and are not shared to Node1 (unless Node2 is also set up as a [subscriber](pub-sub.md) to Node1).
