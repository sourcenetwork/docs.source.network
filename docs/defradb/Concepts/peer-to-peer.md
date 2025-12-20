---
sidebar_label: Peer-to-peer networking
sidebar_position: 10
---

# Peer-to-peer networking

## Overview

Peer-to-peer (P2P) networking is a way for devices or peers to communicate directly without going through a central server. Every peer is equal—both can send and receive data.

DefraDB is a decentralized database built on this idea. Instead of the traditional client-server setup, DefraDB uses P2P networking so apps can sync data locally and share information without relying on a trusted middleman. This supports a decentralized, private, and user-focused approach.

:::tip[Key Points]

DefraDB leverages P2P networking via libp2p to synchronize data directly between distributed nodes, enabling **offline-first applications without a central server**.

**Key capabilities:**

- **Passive replication** – Automatic broadcasting of updates via PubSub (similar to UDP)
- **Active replication** – Direct, point-to-point synchronization between specific nodes (similar to TCP)
- **NAT traversal** – Circuit relays and hole punching to connect nodes behind firewalls
- **Resilient synchronization** – Updates queue offline and sync automatically when connectivity returns

DefraDB stores documents as update graphs (similar to Git) using IPLD blocks distributed across nodes.

:::

## Key concepts

### Libp2p networking framework

Libp2p is a modular, decentralized networking framework created by Protocol Labs for IPFS (InterPlanetary File System). It handles transport, security, peer routing, and content discovery.

DefraDB uses libp2p to let peers talk to each other directly, replicate documents, and manage updates—similar to how Git tracks and merges changes.

**Note**: See [LibP2P documentation](https://docs.libp2p.io/concepts/introduction/overview/#why-libp2p) for more information.

### Documents and collections

- **Document**: A single record with multiple fields, bound by a schema. Similar to a row in an SQL table.
- **Collection**: A group of documents that share the same schema. Similar to an SQL table.

### Why DefraDB needs P2P networking

DefraDB stores documents and [InterPlanetary Linked Data](https://ipld.io/) (IPLD) blocks across multiple nodes, sometimes spread across the globe. P2P networking keeps them in sync whether they're on the same device, on different devices owned by the same user, or shared with collaborators—all without depending on a central server.

### Replication modes

DefraDB supports two replication modes:

**Passive replication**: Automatically broadcasts updates over a global PubSub network (similar to UDP), great for quick sharing with minimal coordination.

**Active replication**: Creates a direct link to a chosen peer (similar to TCP), ensuring updates are delivered reliably to that node.

### How DefraDB implements P2P

- **PubSub**: Nodes can publish and subscribe to topics. Each document gets its own topic for passive replication.
- **Granularity**: Passive replication focuses on individual documents. Active replication can handle whole collections or just selected items.

## Benefits of P2P in DefraDB

DefraDB's P2P architecture provides several key advantages:

- **Resilience**: Keeps working during network outages. Changes are queued and synced later.
- **Trustless operation**: Works without needing to trust a central server.
- **Global collaboration**: Lets developers collaborate across the globe without built-in restrictions.
- **Advanced networking**: Leverages libp2p's features for discovery and NAT traversal.

### NAT traversal solutions

Connecting to a server in a data center is straightforward—each server has its own IP address. However, home networks present a challenge: a single IP address for the modem and multiple devices protected by a NAT firewall make direct connections difficult. Libp2p offers two solutions:

**Circuit Relays**: A third-party node acts as an intermediary to resolve the NAT firewall issue. Both peers connect to this publicly accessible relay node, which serves as a conduit. While this requires trust in the relay node to properly forward information, connections operate over encrypted transport layers, preventing the relay from intercepting data. The relay must remain online and accessible for this to work.

**NAT Hole Punching**: A technique that allows nodes to connect directly to a device behind a NAT firewall, enabling direct peer connections without a trusted intermediary.

## Passive replication

Passive replication is your "set it and forget it" mode. Once it's on, it quietly keeps things in sync without extra effort.

### How passive replication works

- **Automatic activation**: Starts automatically when P2P is enabled.
- **Document-level topics**: Each document has its own PubSub topic.
- **Targeted updates**: Only peers subscribed to that topic receive the changes.
- **Self-organizing**: Nodes find and connect to the right peers on their own.

### When nodes miss updates

In passive replication mode, the most recent update is broadcast through the network using a Merkle DAG (directed acyclic graph). The broadcasting node doesn't verify that receiving nodes have all previous updates—that's the responsibility of the receiving node.

If a node misses updates and then receives a new one, it must synchronize all previous updates before considering the document current. This is necessary because DefraDB's internal data model is based on all changes over time, not just the most recent change.

When broadcasting the most recent update, it's sent over the PubSub network. However, if a node needs to retrieve previous updates by traversing back through the Merkle DAG, it uses the Distributed Hash Table (DHT) instead.

### Use cases for passive replication

Choose passive replication when you:

- Want automatic syncing without managing connections
- Need updates sent to anyone subscribed to a document
- Prefer a low-maintenance option for collaborative environments with many peers

## Active replication

Active replication is like having a dedicated delivery route between you and a specific peer, ensuring that every update reaches them directly.

### How active replication works

- **Direct peer selection**: Choose exactly who you want to sync with by picking a peer and setting up a direct connection.
- **Real-time updates**: Updates are pushed instantly without waiting for network-wide broadcasts.
- **Reliable delivery**: Ideal for important data, making it a great choice when syncing with archival nodes or trusted partners.
- **Flexible granularity**: Allows you to replicate an entire collection or only specific parts you want.

### Use cases for active replication

Choose active replication when you:

- Need a direct, reliable link to a specific peer
- Want real-time updates with no delays
- Need full control over which collections or documents are shared
- Are syncing with archival nodes or specific collaborators

## Peer IDs and addressing

### Peer ID

When DefraDB starts, it creates a Peer ID—a unique identifier based on a private key generated during the first startup. This Peer ID is essential for various parts of the P2P networking system.

### Multi-address format

A node automatically listens on multiple addresses or ports when the P2P module is instantiated. These are expressed as multi-addresses—strings that represent network addresses and include information about transport protocols and multiple network stack layers.

Format:

```bash
/ip4/<ip_address>/tcp/<port>/p2p/<peer_id>
```

Example:

```bash
/ip4/0.0.0.0/tcp/9171/p2p/12D3KooWEFCQ1iGMobsmNTPXb758kJkFc7XieQyGKpsuMxeDktz4
```

By default, DefraDB listens on P2P port `9171`.

## Current limitations and future development

### Scalability considerations

**Document topic overhead**: Having every document with its own independent topic can create overhead with thousands or millions of documents. The team is exploring aggregate topics scoped to subnets (group-specific or application-specific).

**Multi-hop between subnets**: Currently, synchronizing between subnets requires going through the global network, requiring multiple hops. The team is exploring multi-hop mechanisms to address this.

**Bitswap and DHT scalability**: Current limitations are being addressed through:

- **PubSub-based query system**: Allows queries and updates through the global PubSub network using query topics independent of document topics.
- **GraphSync**: A Protocol Labs protocol that may resolve Bitswap algorithm and DHT issues.

### Future improvements

**Head Exchange protocol**: A new protocol in development to address issues with syncing the Merkle DAG when updates have been missed or concurrent, diverged updates have been made. It aims to efficiently:

- Establish the most recent update seen by each node
- Determine if there are divergent updates
- Find the most efficient way to synchronize nodes with minimal communication

**Replicator persistence**: Currently, replicators don't persist through node updates or restarts—they must be re-added after each restart. This will be resolved in a future release.
