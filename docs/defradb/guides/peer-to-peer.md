---
sidebar_label: Peer-to-Peer Guide
sidebar_position: 10
---
# Peer-to-Peer Networking in DefraDB

## Overview

Peer-to-peer (P2P) infrastructure allows entities to communicate and share data directly with each other, eliminating the need for a cloud-based server.

- All devices are equal—each can send and receive data independently.
- No central authority manages synchronization.
- Improves data privacy, autonomy, and reliability.

DefraDB leverages P2P infrastructure instead of the traditional client-server model, enabling efficient, local-first software applications that can function seamlessly even without an internet connection.

- Applications can synchronize data across multiple devices autonomously.
- No need for a central entity to manage synchronization.
- This design fosters data privacy, autonomy, and resilience, ensuring applications continue working in low-connectivity or offline environments.

DefraDB operates in a trustless environment, where no single device holds authority over others.

- Direct Node Communication – Peers exchange updates without intermediaries.
- Increased Reliability – No single point of failure.

A core component of this system is libp2p, a modular networking framework that powers DefraDB’s communication layer. Originally developed for the IPFS project by Protocol Labs, libp2p provides transport, security, peer routing, and content discovery, making it a robust foundation for local-first software.  

In DefraDB, documents are replicated and structured into an update graph, similar to version control systems like Git or hash-linked data structures such as hash chains and hash graphs. P2P infrastructure enables nodes to exchange updates directly, ensuring seamless synchronization of documents within the update graph.  

The libp2p framework is designed to be modular and adaptable, allowing for integration into diverse P2P-based applications. It works seamlessly with IPLD (InterPlanetary Linked Data)—a data model designed for structuring and linking hash-based data. IPLD unifies various hash-linked data models, providing an efficient mechanism for navigating and managing distributed data structures.  

By combining libp2p’s infrastructure capabilities with IPLD’s data linking model, DefraDB ensures that applications remain distributed, secure, and highly scalable, while maintaining efficient document synchronization across devices in a local-first software infrastructure.  

## Documents and Collections

In DefraDB, data is structured using documents and collections:  

- **Documents**: A document is a single record composed of multiple fields, governed by a defined schema. This is similar to a row in an SQL table, where each row contains multiple columns. In this analogy, the row represents the document, and the columns represent individual fields.  

- **Collections**: A collection is a group of documents that share a common schema. This is analogous to a table in an SQL database, where multiple rows (documents) adhere to the same column structure (schema).  

## Why DefraDB needs P2P Infrastructure

DefraDB relies on peer-to-peer (P2P) infrastructure to facilitate efficient data synchronization between nodes. This is crucial because DefraDB manages documents and IPLD blocks across multiple nodes, which may be accessed by a single application or multiple interconnected applications.  

P2P infrastructure allows local instances of DefraDB—whether on a single device or embedded within a browser—to replicate and synchronize information with other devices belonging to the same entity or trusted collaborators. These collaborators could serve as historical archival nodes or participate in data-sharing workflows without relying on a cloud-based intermediary.  

For example, in a collaborative document-sharing scenario, DefraDB ensures that data is transmitted directly between peers, removing the need for a central server to manage synchronization.  

DefraDB supports two distinct types of P2P replication:  

- **Passive Replication** – Allows nodes to passively receive updates to documents they have subscribed to, ensuring efficient synchronization of frequently accessed data.  
- **Active Replication** – Enables direct, point-to-point synchronization of entire collections or specific documents, ensuring up-to-date data across multiple nodes.  

By leveraging local-first software and edge computing principles, DefraDB provides a resilient, scalable, and privacy-focused approach to data management.

## How it works

DefraDB supports two distinct data replication methods: passive replication and active replication. Each method serves different use cases and operates using unique mechanisms to ensure efficient data synchronization across nodes.  

### Passive Replication

Passive replication enables automatic data broadcasting across the network without explicit coordination. This mechanism operates over a publish-subscribe (PubSub) network, where updates are shared on a specific topic, allowing subscribed peers to receive relevant data in real time.

#### Key Characteristics of Passive Replication

- "Fire and Forget" approach: Updates are broadcasted without requiring direct acknowledgments from recipients.
- Default Behavior: Enabled for all nodes by default, ensuring seamless data propagation across the infrastructure.
- Analogy to UDP: Similar to the User Datagram Protocol (UDP), passive replication operates in a connectionless manner, where messages are sent without guaranteeing delivery confirmation.  

#### Use Case

Ideal for **collaborative environments** where multiple applications or entities need to stay synchronized with minimal coordination. For instance, in a **shared document scenario**, multiple collaborators can receive real-time updates without direct peer-to-peer interactions.  

---

### Active Replication

Active replication establishes **direct, point-to-point synchronization** between nodes, ensuring **reliable data transfer** and **acknowledged receipt** of updates.  

Unlike passive replication, which relies on the **Gossip protocol** (a mechanism where nodes periodically exchange state information to achieve synchronization), active replication maintains a **persistent connection** between two specific nodes. This allows data to be continuously pushed and acknowledged in a structured manner.  

### **Key Characteristics of Active Replication:**  

- **Direct Node-to-Node Synchronization**: A dedicated peer is selected to receive updates from the local node.  

- **Acknowledgment-Based Communication**: Ensures that updates are successfully received and confirmed, unlike passive replication.  

- **Analogy to TCP**: Similar to the **Transmission Control Protocol (TCP)**, active replication maintains a reliable, ordered, and error-checked data transmission channel.  

- **Multi-Hop vs. Direct Connection**: The **Gossip protocol (used in passive replication)** spreads updates across multiple network hops, while active replication forms a **direct communication channel** between two nodes.  

### **Use Case:**  

Best suited for scenarios where **reliable, dedicated synchronization** is required. For example:  

- **Ensuring complete data replication to an archival node** for backup purposes.  
- **One-on-one collaboration**, where two entities must remain in perfect sync with **guaranteed data consistency**.  

---

## **Choosing the Right Replication Method**  

| **Replication Type** | **Best For** | **Network Behavior** | **Delivery Guarantee** |
|:-------------------|:------------|:--------------------|:---------------------|
| **Passive Replication** | Broad synchronization with minimal overhead | Broadcasts updates to a publish-subscribe network | No direct delivery confirmation (like UDP) |
| **Active Replication** | Reliable, point-to-point synchronization | Direct connection between two nodes | Guaranteed delivery with acknowledgments (like TCP) |

By leveraging both replication strategies, DefraDB ensures a flexible, scalable, and efficient approach to managing local-first software and edge computing environments.

## Implementation of Peer-to-Peer Networking in DefraDB

In the DefraDB software architecture, peer-to-peer networking is implemented using a **Publish-Subscribe (PubSub)** system. Here's how it works:

### PubSub System Overview

- **Publishers** send messages without targeting specific receivers.
- **Subscribers** express interest in specific types of messages, regardless of who sends them.
- This model allows for:
  - Dynamic network topology
  - Enhanced scalability
- Nodes in the network can:
  - **Publish** messages to specific topics
  - **Subscribe** to topics to receive relevant messages

### Passive Replication Using Gossip Protocol

- When a node **publishes a message**:
  - It is **broadcasted** to all nodes in the network.
  - Nodes **re-broadcast** and **gossip** the message via multiple hops.
  - This behavior is governed by the **Gossip protocol**, ensuring wide dissemination.
- **Per-document topics**:
  - Each document is assigned its own topic.
  - Nodes can subscribe to specific document topics to receive updates.
- **Hot vs. Cold documents**:
  - Frequently accessed or updated documents (“hot documents”) keep open connections for timely syncing.
  - Infrequently accessed ones (“cold documents”) are easily resynced by querying updates as needed.

### Focus of Passive Replication

- Designed for **individual document-level synchronization**
- Ideal for:
  - High-demand documents
  - Environments with dynamic collaboration

### Comparison with Active Replication

- **Active Replication**:
  - Works over **direct, point-to-point connections**
  - Supports:
    - Entire **collection-level replication**
    - **Granular replication** of selected documents within a collection
- **Passive Replication**:
  - Limited to **individual document-level** replication
  - Operates via the **PubSub network** using the **Gossip protocol**

### Example Use Case

- If you have a **collection of books**:
  - **Active replication** can replicate the entire collection or just selected books to a specific node.
  - **Passive replication** focuses only on syncing individual books that nodes are subscribed to.

## Features of P2P in DefraDB

DefraDB is designed for local-first software and edge environments, replacing the traditional cloud-based model with distributed, application-centric infrastructure. At its core, it leverages libp2p, a modular networking stack, to support flexible peer-to-peer data synchronization. Below are the concrete capabilities of DefraDB’s peer-to-peer infrastructure, categorized into Passive Replication and Active Replication.

### Passive Replication Features

Passive replication enables automatic, per-document data broadcasting across the distributed infrastructure. This system is enabled by default when a node is started using the Defra Command Line Interface (CLI).

1. **Node Initialization with libp2p Host**
    When starting a DefraDB node, it automatically sets up a libp2p host with a unique Peer ID derived from a secret private key:

    ```sh
    $ defradb start
    ...
    Jan  2 10:15:49.124 INF cli Starting DefraDB
    Jan  2 10:15:49.161 INF net Created LibP2P host PeerId=12D3KooWEFCQ1iGMobsmNTPXb758kJkFc7XieQyGKpsuMxeDktz4 Address=[/ip4/127.0.0.1/tcp/9171]
    Jan  2 10:15:49.162 INF net Starting internal broadcaster for pubsub network
    Jan  2 10:15:49.163 INF node Providing HTTP API at http://127.0.0.1:9181 PlaygroundEnabled=false
    Jan  2 10:15:49.163 INF node Providing GraphQL endpoint at http://127.0.0.1:9181/api/v0/graphql
    ```

    - The Peer ID is critical for node discovery and participation in distributed document synchronization.
    - The libp2p stack can be toggled on or off:

    ```sh
    defradb start --no-p2p
    ```

1. **Managing Passive Networking Behavior**

   - To enable passive replication and specify target peers:

   ```sh
   defradb start --peers /ip4/0.0.0.0/tcp/9171/p2p/<peerID>
   ```

   - To change the peer-to-peer listening address:

   ```sh
   defradb start --p2paddr /ip4/0.0.0.0/tcp/9172
   ```

2. **Understanding Multi-Addresses**
Multi-addresses define how a node communicates, detailing protocol and addressing layers:

    ```sh
    /ip4/0.0.0.0/tcp/9171/p2p/<peerID>
    Format: scheme/ip_address/protocol/port/protocol/peer_id
    ```

The default P2P port is 9171, but this is customizable.

1. **Document-Based Subscription Logic**
   - On startup, each document in DefraDB is evaluated through an LRU (Least Recently Used) cache, determining the most relevant or frequently used ones.
   - The node automatically subscribes to topics associated with these documents on the PubSub network.
   - Nodes self-organize by discovering and maintaining connections with other relevant nodes in the same document topic.

1. **Network Awareness and Peer Discovery**
   - When joining a document topic, the node queries the distributed network to discover additional peers sharing the same topic.
   - This dynamic discovery ensures robust and up-to-date communication with trusted collaborators.

### Active Replication Features

Active replication allows entities to define precise synchronization rules at both document and collection levels using direct point-to-point communication.

To replicate a specific collection (e.g., Books) to another peer, use the following RPC command:

```bash
defradb client p2p replicator set -c Books <peerID>
```

This command:

- Adds the specified peer to the replicator set
- Enables the node to sync an entire collection or selected documents within it
- Handles the creation of direct sync pathways between designated peers

| Feature                 | Passive Replication                         | Active Replication                             |
|:------------------------|:---------------------------------------------|:-----------------------------------------------|
| Granularity             | Document-level only                          | Collection and document-level                  |
| Topology                | PubSub (broadcast + gossiping)              | Point-to-point                                 |
| Peer Discovery          | Automatic via topic subscriptions           | Manual via replicator commands                 |
| Use Case                | High-frequency document updates             | Full dataset sharing or selective replication  |
| Configuration Method    | CLI flags + topic auto-subscription         | RPC-based replicator setup                     |

By emphasizing local-first software principles, DefraDB ensures robust, offline-capable, and privacy-respecting data synchronization between applications—without reliance on cloud intermediaries.

## Benefits of the P2P System

The peer-to-peer (P2P) system offers key advantages, especially in the context of local-first software and edge computing. One of the most important benefits is its robustness, which allows for continuous operation even during network disruptions. In the event that an entity’s node loses internet connectivity, the P2P system ensures that changes continue locally and updates are queued. Once the connection is restored, the system seamlessly synchronizes updates, resolving any discrepancies and resuming data replication to specified nodes. This approach eliminates the need for a trusted intermediary and allows data to be exchanged directly between entities. Developers can collaborate across the distributed infrastructure with no limitations, regardless of location. Additionally, the underlying libp2p framework provides added features to enhance the functionality of the P2P system, making it an excellent choice for local-first, edge-driven applications.

In scenarios where nodes are behind NAT firewalls—common in home networks—P2P communication faces potential obstacles. However, the system utilizes two solutions to overcome these challenges:

- **Circuit Relays**: These allow for a third-party intermediary to resolve NAT firewall issues. The third-party node acts as a conduit for communication, requiring trust but maintaining security through encrypted layers to prevent man-in-the-middle attacks.
- **NAT Hole Punching**: A technique that enables direct communication between nodes even if they are behind NAT firewalls. This eliminates the need for a trusted intermediary, enabling seamless peer-to-peer connections.

## Current Limitations and Future Outlook

Despite its many benefits, there are several limitations to the P2P system that need to be addressed:

1. **Scalability of Independent Document Topics**: The current model assigns each document a unique topic, which can create overhead for entities managing large datasets. To resolve this, the team is exploring the use of aggregate topics, scoped to specific subnets—whether application-specific or group-specific. This would require multiple hops between subnets, but multi-hop mechanisms are being investigated to enhance efficiency.

1. **Missed Updates in Passive Replication**: In passive replication, updates are broadcasted via a Merkle DAG (directed acyclic graph). If a node is offline or misses an update, it is the responsibility of that node to synchronize all previous changes before the document is considered up-to-date. The Distributed Hash Table (DHT) is used to retrieve missing updates, but the scalability of Bitswap and DHT needs improvement. To address these concerns, two new protocols are under consideration:

   - **PubSub-based Query System**: This system allows entities to query and receive updates through global PubSub topics, independent of document topics. This flexibility can significantly enhance scalability.
   - **Graph Sync**: Developed by Protocol Labs, this protocol has the potential to resolve the scalability challenges of Bitswap and DHT, further improving the efficiency of the distributed P2P infrastructure.

1. **Replicator Persistence**: Currently, when replicators are added to a node, they do not persist across updates or restarts. This means that entities must re-add replicators after each restart. This limitation will be addressed in the next system release.

1. **Head Exchange Protocol**: A new protocol called Head Exchange is under development to address synchronization issues in the Merkle DAG, especially when updates are missed or when divergent updates occur. This protocol aims to efficiently identify the most recent update seen by each node and synchronize the network with minimal communication.

1. **NAT Firewall Connectivity**: A significant challenge in local-first development is the difficulty for nodes to connect when they are running within the same home network, behind a NAT firewall. These firewalls protect private networks but can make direct peer-to-peer communication difficult. To solve this, the system uses NAT hole punching and circuit relays to enable secure and direct communication between nodes.

Overall, while there are some challenges to overcome, the development team is focused on enhancing the scalability, synchronization, and connectivity of the P2P system, ensuring it remains a powerful and reliable tool for local-first, edge-driven applications.
