---
title: InterPlanetary File System (IPFS)
---

## Overview

The **InterPlanetary File System (IPFS)** is a **distributed** system designed to enable peer-to-peer access to websites, applications, files, and data using **content addressing** instead of traditional location-based addressing. The fundamental goal of IPFS is to revolutionize how information is shared across networks by making it more **efficient, resilient, and censorship-resistant**.

## Key Features

IPFS is built on several core principles that distinguish it from conventional web technologies:

- **Distributed Infrastructure:** Information is retrieved from multiple nodes instead of relying on a single centralized server.
- **Content Addressing:** Data is identified by its **cryptographic hash**, ensuring content integrity and eliminating reliance on specific locations (URLs).
- **Decentralized Participation:** The network thrives on active participation, where multiple users store and share files, making data more accessible and resilient to failures.

## Why IPFS? Advantages of a Distributed Web

Unlike traditional web systems that rely on centralized servers, IPFS offers several benefits:

- **Resilience to Failures:** Since content is retrieved from multiple sources, it remains available even if some nodes go offline.
- **Faster Content Delivery:** By retrieving content from the nearest available node, IPFS can significantly reduce latency and bandwidth costs.
- **Censorship Resistance:** IPFS makes it difficult for a single entity to control or restrict access to content.
- **Efficient Storage:** Duplicate files are automatically deduplicated across the network, optimizing storage usage.

## How IPFS Works

IPFS operates using three key mechanisms:

### 1. Content Addressing

- Each file is assigned a **unique cryptographic hash** (Content Identifier or CID).
- Any change to the file results in a new hash, ensuring integrity and version control.

### 2. Directed Acyclic Graphs (DAGs) for Content Linking

- Data is structured as a **Merkle Directed Acyclic Graph (DAG)**, where each node contains links to its components.
- This allows for efficient data distribution and version tracking.

### 3. Distributed Hash Tables (DHTs) for Content Discovery

- When a user requests a file, IPFS looks up its CID in a **Distributed Hash Table** (DHT) to locate peers storing the requested content.
- The system retrieves the file from the nearest or most efficient source.

## How to Use IPFS

### 1. Adding a File to IPFS

- A user adds a file to IPFS using an IPFS node.
- The file is broken into chunks and given a unique CID.
- The CID can be used to retrieve the file later.

### 2. Retrieving a File from IPFS

- Users request content by CID.
- IPFS locates the closest nodes storing that file and delivers the data in a peer-to-peer fashion.

### 3. Pinning and Persistence

- IPFS does not permanently store all files; users must "pin" files to keep them accessible on their own nodes.
- Content persistence is ensured by either pinning files manually or using **IPFS pinning services**.

## Considerations and Limitations

While IPFS offers significant advantages, users should be aware of:

- **Storage Responsibility:** Files may disappear unless pinned or actively shared by multiple peers.
- **No Built-in Encryption:** While data integrity is ensured, encryption must be handled separately if needed.
- **Bandwidth Usage:** Nodes that participate in the network contribute bandwidth, which may impact performance on limited connections.

## Getting Started with IPFS

To start using IPFS:

1. Install IPFS from the [official IPFS website](https://ipfs.io).
1. Initialize an IPFS node using:

```sh
ipfs init
```

1. Add a file to IPFS:

```sh
ipfs add myfile.txt
```

1. Retrieve a file using its CID

```s
ipfs cat <CID>
```

## Further Reading

For more in-depth knowledge, explore:

- [IPFS Official Documentation](https://docs.ipfs.tech/)
- [IPFS Whitepaper](https://ipfs.io/ipfs/QmR7GSQM93Cx5eAg6a6vTyWKNXq8Rz5KZX3u37aS1WbDyB)
- [IPFS GitHub Repository](https://github.com/ipfs)

IPFS represents a fundamental shift towards a more open, resilient, and decentralized internet, paving the way for the future of data distribution and web applications.
