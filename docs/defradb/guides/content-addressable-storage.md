---
sidebar_label: Content Addressable Storage
sidebar_position: 80
---

# Overview
*Intro to CAS, why it matters, and how it’s different from location-based storage.*

Content-Addressable Storage (CAS) is a way of storing data where each piece is identified by the cryptographic hash of its content, rather than by its physical or network location. In traditional storage systems, such as filesystems or cloud buckets, data is located through a path or a URI. With CAS, every unique piece of content gets its own globally unique, unchanging identifier: its content hash. This makes data tamper-evident, automatically deduplicated, and easy to share across peer-to-peer networks. CAS is important because it supports trust, versioning, and decentralization in modern data systems.

# How DefraDB Uses CAS
*Explain IPLD, Merkle DAGs, and hash-based addressing in plain language. How records are stored/retrieved.*

DefraDB’s data model is built on IPLD (InterPlanetary Linked Data), which uses Merkle Directed Acyclic Graphs (Merkle DAGs) and hash-based addressing. Here’s what that means in plain language:

* **IPLD**: This is a way to represent and connect data across distributed systems using hashes. It makes data universally linkable and verifiable.

* **Merkle DAGs**: In DefraDB, every document and every update is a node in a Merkle DAG. Each change creates a “commit,” similar to Git. The commit has its own hash and also links back to earlier commits by their hashes.

* **Hash-based addressing**: Each version of a document, or even a field update, is given a unique identifier called a CID (Content Identifier). The CID is generated from the content itself, so if the content changes, the CID changes too.

**Storage and retrieval**: When you create or update a document, DefraDB saves the difference (the part that changed) and assigns it a CID. To fetch the data, a user or peer asks for the CID. The system then finds the content and verifies it by recalculating the hash.

# Why It Matters
*Benefits to be detailed*

CAS in DefraDB provides several important architectural advantages:

* **Immutability and auditability**: Every update to a document is recorded permanently and can be verified independently.

* **Deduplication**: Because each piece of data is identified by its content, identical data is automatically stored only once.

* **Tamper-evidence**: If someone tries to alter data, the hash no longer matches, making unauthorized changes easy to detect.

* **Peer-to-Peer friendly**: CAS works seamlessly with Merkle DAGs to support peer-to-peer syncing and local-first software, which is especially valuable for offline and edge environments.

* **Efficient versioning**: All previous states of data remain accessible, making advanced features like time-travel queries possible.

# CAS in Action
Walk through a practical example: storing data, retrieving it by hash, and how updates flow across peers.

# How It Connects
show how CAS underpins CRDTs, synchronization, and offline-first patterns.

# For Developers
Add code snippets, commands, and API references