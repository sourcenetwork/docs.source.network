---
title: DefraDB P2P setup
---

One database is great, but it quickly becomes useless if hamsters eat its disks or a tsunami floods its fans. Humanity has been adding redundancy to its setups ever since poligamy was a thing.

DefraDB uses peer-to-peer networking for data exchange, synchronization, and replication of documents and commits. 
When a node is started for the first time, a key pair is generated and stored in its root directory (`~/.defradb/` by default).
Each node has a unique `PeerID` generated from its public key. This ID allows other nodes to connect to it.

There's two types of peer-to-peer relationships:

- [Publisher-Subscriber](pub-sub.md) -- Passively synchronizes data between nodes by broadcasting document commit updates to the topic of the collection name. Nodes need to set up a shared collection and to be listening on the pubsub channel to receive updates and keep their documents in sync.
- [Replicator](replicator.md) -- Actively pushes changes from a specific collection to a target peer.


## Setup {/* #setup */}

The following P2P pages assume that you have two instances of DefraDB running on the same network. One way to start multiple DefraDB nodes, each with its root directory and port bindings, is by tweaking the `start` CLI options.

```shell title="Start Node 1 - Ports 9171 and 9181, root dir ~/.defradb-node1"
defradb start --rootdir ~/.defradb-node1 --p2paddr /ip4/127.0.0.1/tcp/9171 --url localhost:9181
```

```shell title="Start Node 2 - Ports 9172 and 9182, root dir ~/.defradb-node2"
defradb start --rootdir ~/.defradb-node2 --p2paddr /ip4/127.0.0.1/tcp/9172 --url localhost:9182
```

```shell title="Startup log for Node 1"
INF cli Starting DefraDB
INF p2p Created LibP2P host PeerID=12D3KooWDy7z9Y6qANCUXADpwYn7cnHoHBAL4MrAuYeWpwA9UePt Address=[/ip4/127.0.0.1/tcp/9171]
...
```

```shell title="Startup log for Node 2"
INF cli Starting DefraDB
INF p2p Created LibP2P host PeerID=12D3KooWHwpvkxhfFtX7kPZSj9XJ5wvgitqZ5mt2uWVpV5kkzQX4 Address=[/ip4/127.0.0.1/tcp/9172]
...
```
