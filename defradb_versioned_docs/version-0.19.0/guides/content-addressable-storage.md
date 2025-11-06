---
sidebar_label: Content Addressable Storage
sidebar_position: 80
---

# Content Addressable Storage

## Overview

Content-Addressable Storage (CAS) is a way to store data that works differently from what you might be used to. Normally, when you save something on your computer or online, you find it by where it is stored, like a file path or a website address. But with CAS, each piece of data gets its own special ID based on what it actually is.

This special ID comes from running the data through a hash function, which turns it into a unique digest. If the data changes even a little, the digest changes too. Content-addressable storage can tell if someone tried to change or mess with the data. It also saves space because if two pieces of data are exactly the same, it stores that data only once.

This method matters because it helps keep data safe and trustworthy. It makes it easy to track different versions over time and works well in systems where many computers share data with each other.

## How DefraDB uses CAS

DefraDB’s data model is built on IPLD (InterPlanetary Linked Data), which connects and represents data using Merkle Directed Acyclic Graphs (Merkle DAGs) and hash-based addressing. Here’s what these terms mean in simple language:

* **IPLD**: This is a way to represent and connect data across distributed systems using hashes. It makes data universally linkable and verifiable.

* **Merkle DAGs**: In DefraDB, every document and every update is a node in a Merkle DAG. Each change creates a “commit,” similar to Git. The commit has its own hash and also links back to earlier commits by their hashes.

* **Hash-based addressing**: Each version of a document, or even a field update, is given a unique identifier called a CID (Content Identifier). The CID is generated from the content itself, so if the content changes, the CID changes too.

* **Storage and retrieval**: When you create or update a document, DefraDB saves the difference (the part that changed) and assigns it a CID. To fetch the data, a user or peer asks for the CID. The system then finds the content and verifies it by recalculating the hash.

## Why it matters

Using CAS in DefraDB brings many benefits that make data safer, easier to manage, and more flexible.

* **Immutability and auditability**: Every time you change a document, DefraDB records that update permanently. You can always see what happened and when, making the data trustworthy.

* **Deduplication**: DefraDB stores only one copy of identical data because it identifies data by its content. This saves space and makes storage efficient.

* **Tamper-evidence**: If someone changes data without permission, the content hash stops matching. DefraDB can detect this easily.

* **Peer-to-peer friendly**: CAS works well when many computers share data directly. DefraDB syncs updates quickly, even when offline or on weak networks.

* **Efficient versioning**: DefraDB saves every change with its own ID. You can go back to any earlier version of the data, making “time travel” through history possible.

## CAS in Action

Here’s how it works step by step:  

* **Storing data**: When you create a new document, like a user profile, DefraDB calculates a unique digest called a CID by hashing the document content. The CID becomes the document’s permanent ID. DefraDB stores the document under that CID. If two documents have the same content, then they share the same CID and DefraDB stores the data only once.

* **Updating data**: When you change a document, DefraDB does not replace the old data. It saves the update as a separate new node, linking it to the previous version and forming a chain called a Merkle DAG. Each update gets its own CID representing a new version. DefraDB keeps the full change history this way.

## Synchronization Process

Content-addressable storage gives DefraDB a strong foundation to manage data across devices, users, and network conditions. Here is how it supports key features step by step:

### Supporting CRDTs for Conflict-free Collaboration

DefraDB implements **Merkle CRDTs**, a specialized type of Conflict-free Replicated Data Type that combines traditional CRDT merge semantics with Merkle DAGs for efficient distributed collaboration:

**Merkle Clock Implementation:**

1. Each document change creates a new node in the Merkle DAG with a unique CID and a height value (incremental counter)
2. The Merkle clock uses the inherent causality of the DAG structure—since node A's CID is embedded in node B, A must exist before B
3. This eliminates the need to maintain per-peer metadata, making DefraDB efficient in high-churn networks with unlimited peers

**Delta State CRDT Semantics:**

1. DefraDB uses delta state-based CRDTs that only transmit the minimum "delta" needed to transform one state to another
2. Instead of sending entire document states, only the changed portion (like adding "banana" to a fruit set) is transmitted
3. This hybrid approach provides the benefits of both operation-based (small message size) and state-based (reliable delivery) CRDTs

**Branching and Merging:**

1. When peers make concurrent edits, the Merkle DAG naturally branches into independent states
2. Each branch maintains its own valid history until synchronization occurs
3. Merging creates a new "merge node" with multiple parents, applying CRDT-specific merge semantics
4. The system finds common ancestral nodes using height parameters and CIDs to resolve conflicts deterministically

**Conflict Resolution Process:**

1. When conflicts occur, DefraDB traverses both branches back to their common ancestor
2. The embedded CRDT type (register, counter, set, etc.) defines the specific merge rules
3. All changes are preserved in the final merged state, ensuring no data loss
4. The resulting merge maintains the DAG structure and provides a new canonical head

### Enabling Efficient Synchronization Across Peers

1. Peers exchange CIDs representing the latest document versions.
1. Compare received CIDs with its own and requests only missing data.
1. Verify data by recalculating the hash and matching it to the CID. Peers reject any data that does not match.
1. Verified data is added to the local Merkle DAG to update the document history.

### Making Offline-first Work Smoothly

1. Users make changes locally even without internet. Each update gets a new CID and joins the local Merkle DAG.
1. When online again, devices share new CIDs and sync changes.
1. DefraDB merges updates from different peers using CRDT rules using full change histories.
1. This process ensures all peers arrive at the same up-to-date data without conflicts or loss.

Overall, content-addressable storage lets DefraDB create reliable, easy-to-sync, and conflict-free data systems that work online and offline.
