---
title: Publisher-Subscriber
---

When one node receives a query that updates a collection (ex. create/alter documents), it broadcasts the update to its network of peers. Peers can listen for updates on a specific collection and use those to keep its state in sync with the broadcaster's state. Any number of nodes can join a peer-to-peer network, and any number of nodes can publish updates at the same time. Like in a ghossip circle, there's no leader: just a friendly community of peers that live by two principles:

- they promise to share any new information they receive
- they promise to update themselves with the information they receive from their peers

Any node in the community is at all times a *publisher* to other peers, and can at any moment become a *subscriber* to other peers.

:::note
This page assumes you have (at least) two running instances of DefraDB (see [Setup](/p2p/index#setup)).
:::

## DefraDB Pub-Sub P2P setup {/* #pub-sub-setup */}

To connect one node to other peers with the publisher-subscriber model, you only need the peers' [multiaddresses](https://docs.libp2p.io/concepts/addressing/). For example, a node at IP `127.0.0.1` listening on port `9171` with PeerID `12D3KooWDy7z9Y6qANCUXADpwYn7cnHoHBAL4MrAuYeWpwA9UePt` has multiaddress `/ip4/127.0.0.1/tcp/9171/p2p/12D3KooWDy7z9Y6qANCUXADpwYn7cnHoHBAL4MrAuYeWpwA9UePt`.

The requirements are two-fold:

1. All peers must have a common collection 
1. The peers who want to listen to other peers' updates must:
    1. Connect with them
    1. Subscribe to updates on the collection

### Create a common collection {/* #create-collection */}

All peers must know about the collection they are going to send/receive updates about. The collection must have the same fields across all peers.

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

### Connect peers {/* #connect-peers */}

Before being able to subscribe to collection updates, nodes must connect to each other (and become peers).

```shell title="Get peer info for Node1"
defradb client p2p info --url localhost:9181
```
```json title="Output"
[
  "/ip4/127.0.0.1/tcp/9171/p2p/12D3KooWDy7z9Y6qANCUXADpwYn7cnHoHBAL4MrAuYeWpwA9UePt"
]
```

```shell title="Connect Node1 and Node2"
defradb client p2p connect /ip4/127.0.0.1/tcp/9171/p2p/12D3KooWDy7z9Y6qANCUXADpwYn7cnHoHBAL4MrAuYeWpwA9UePt --url localhost:9182
```

It's enough to connect one node to another for the other to reciprocate: unlike love, peer-to-peer relationships are always mutual.

:::tip
You can also provide Node1's peer info via the `--peer` option when starting Node2:

```shell title="Start Node2 with Node1 as peer"
defradb start --rootdir ~/.defradb-node2 --p2paddr /ip4/127.0.0.1/tcp/9172 --url localhost:9182 --peers /ip4/127.0.0.1/tcp/9171/p2p/12D3KooWDy7z9Y6qANCUXADpwYn7cnHoHBAL4MrAuYeWpwA9UePt
```

More peers can always be added on a running instance with the CLI command [`defradb client p2p connect`](/references/cli/defradb_client_p2p_connect.md).
:::

To see which peers a node is connected to, use the CLI command [`defradb client p2p active-peers`](/references/cli/defradb_client_p2p_active-peers.md):

```shell title="Node2 active peers"
defradb client p2p active-peers --url localhost:9182
```
```json title="Node2 - Output"
[
  "/ip4/127.0.0.1/tcp/9171/p2p/12D3KooWDy7z9Y6qANCUXADpwYn7cnHoHBAL4MrAuYeWpwA9UePt"
]
```

### Subscribe to updates on a collection {/* #subscribe */}

To subscribe to collection updates, use the CLI command [`defradb client p2p collection add`](/references/cli/defradb_client_p2p_collection_add.md):

```shell title="Node2 - Subscribe to User collection
defradb client p2p collection add User --url localhost:9182
```

As confirmation, the logs for Node2 report that a new *pubsub topic* was added:

```text title="Node2 - Log output"
Apr 30 11:42:01.717 INF p2p Adding pubsub topic PeerID=12D3KooWDy7z9Y6qANCUXADpwYn7cnHoHBAL4MrAuYeWpwA9UePt Topic=bafyreigk7nwtnurbwzv3uemdqo5czgafh33q5s3cylol4ozgvja75i5mca
```

Note how you don't specify *to what peer's* collection you subscribe to: Node2 will listen to updates from *any peer* and update its local state accordingly. The local collection is the result of the shared state of all peers.

When a document update is submitted to Node1, Node2 receives the update as a *pubsub message*:

```text title="Node2 - Log output"
Apr 30 11:45:11.788 INF p2p Received new pubsub message PeerID=12D3KooWHwpvkxhfFtX7kPZSj9XJ5wvgitqZ5mt2uWVpV5kkzQX4 SenderId=12D3KooWDy7z9Y6qANCUXADpwYn7cnHoHBAL4MrAuYeWpwA9UePt Topic=bafyreigk7nwtnurbwzv3uemdqo5czgafh33q5s3cylol4ozgvja75i5mca
```

:::info
An instance's list of peers is cleared on shutdown, so you will need to reconnect peers when restarting it. Pub-sub subscriptions are instead retained across restarts.
:::

:::tip
```shell title="Add multiple collection names at once"
defradb client p2p collection add <name1>,<name2>,... --url localhost:9182
```
:::
