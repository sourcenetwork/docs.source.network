---
sidebar_label: Time Traveling Queries Guide
sidebar_position: 40
---
# Time Traveling Queries in DefraDB

## Overview

Applications built with **local-first software** frequently require the ability to inspect how a piece of information evolved over time. This is especially critical in environments where data is collaboratively managed and replicated across edge compute devices. Traditional data management systems fall short in this area—once a document is updated, the prior state is typically lost unless manually backed up. 

**DefraDB** solves this problem by introducing **Time Traveling Queries**—a feature that allows entities to access the exact state of a document as it existed at any point in its version history. By leveraging cryptographic **Content Identifiers (CIDs)** and Conflict-free Replicated Data Types (CRDTs), DefraDB empowers edge applications to query historical document states natively and efficiently.

---

## What Are Time Traveling Queries?

A **Time Traveling Query** is a standard query with an added `cid` parameter that instructs DefraDB to return the document's state at that specific version. CIDs are derived from the document’s underlying data, ensuring immutability and content-addressable consistency across distributed environments.

```graphql
query {
  User (
    cid: "bafybeieqnthjlvr64aodivtvtwgqelpjjvkmceyz4aqerkk5h23kjoivmu",
    docID: "bae-d4303725-7db9-53d2-b324-f3ee44020e52"
  ) {
    name
    age
  }
}
```

This retrieves the `User` document as it existed when the given CID was generated, regardless of any subsequent changes.

---

## Why It Matters

### Without Time Traveling Queries

In most cloud-based or traditional systems, document updates overwrite prior values. Even when backups or snapshots are used, they often lack precision, and access involves significant latency or operational complexity. This leads to:

- Lost visibility into the lifecycle of a document.
- No way to validate historical states for auditing or debugging.
- Difficulty satisfying compliance or traceability requirements.

### With Time Traveling Queries

By incorporating Time Traveling Queries into a local-first database model, DefraDB allows applications to:

- Inspect changes over time with fine-grained detail.
- Reproduce document states for validation, debugging, or historical analysis.
- Reduce reliance on separate backup mechanisms.
- Enable embedded edge software to operate independently while retaining auditability.

---

## How It Works

Under the hood, DefraDB uses **Merkle CRDTs**—a data structure that combines the benefits of Merkle Directed Acyclic Graphs (DAGs) with Conflict-free Replicated Data Types. Each update to a document is recorded as a delta (a small payload of changes), and these updates form a chain that connects back to the genesis state.

When a Time Traveling Query is issued:

1. The engine identifies the target CID in the document's DAG.
2. It traverses back through the chain to reconstruct the document at that specific point in time.

### Key Technical Features

- **Immutable Snapshots**: CIDs are content-addressed hashes, guaranteeing the integrity of every version.
- **Field-Level Tracking**: Each field in a document has its own delta chain, allowing for extremely fine-grained reconstruction.
- **Embedded Replay Engine**: Even if a device is offline or disconnected from the infrastructure, local compute can reconstruct state from stored deltas.

---

## Use Cases

- **Application Debugging**: Quickly identify what changed and when.
- **Data Auditing**: Retrieve document state for compliance or historical verification.
- **Collaborative Editing**: Support undo functionality or version comparison within local-first applications.
- **Edge-Based Automation**: Allow devices embedded with local software to reason about historical context even in isolation.

---

## Limitations

### 1. No Relational Time Travel (Yet)

Currently, Time Traveling Queries apply only to individual documents. For example, retrieving a `Book` document at a past version will not automatically return its related `Author` document as it existed at the same time. Relationship-aware time travel is on the roadmap.

### 2. Performance Overhead

Time Traveling Queries reconstruct state by replaying changes from the document’s genesis. This incurs computational overhead proportional to the number of deltas. Optimization strategies, such as periodic snapshots, can reduce traversal cost.

---

## Future Enhancements

- **Snapshot Support**: Developers will be able to configure periodic state snapshots (e.g., every 1,000 deltas). This trades a small increase in data size for faster query execution.
- **Relational Time Travel**: Planned enhancements will allow traversing document relationships using doc keys within CRDT graphs. This will enable fetching a consistent multi-document state as it existed at a specific time.

---

## FAQs

**Q: Is this like Git for documents?**  
A: Conceptually, yes. Just like Git uses commit hashes to represent source code versions, DefraDB uses CIDs to represent document states.

**Q: What’s the cost of storing all historical data?**  
A: Each update is stored as a delta. These are highly compressed and space-efficient. Additionally, snapshotting can reduce retrieval times without significantly increasing size.

**Q: Can I use this from a frontend app?**  
A: Yes. Time Traveling Queries use the same query structure with the addition of a `cid`. They are fully accessible through any client that supports GraphQL-like syntax.

**Q: How are deletions handled?**  
A: Deletions are treated as regular updates. They remain part of the document’s historical graph and are retrievable just like any other version.

**Q: Can I query linked documents in historical context?**  
A: Not yet. However, relational graph traversal in time travel is a planned feature.

**Q: How does this help in local and embedded environments?**  
A: Devices with embedded local software can retain full document histories and execute Time Traveling Queries without relying on cloud connections, ideal for environments with intermittent connectivity.

---

## Conclusion

Time Traveling Queries bring powerful historical insights into local-first applications. Whether you're building collaborative editing tools, audit-traceable systems, or privacy-preserving edge infrastructure, this feature offers a novel and efficient way to access the past—securely and locally. By enabling immutable, CID-based versioning, DefraDB gives applications embedded with local compute the ability to understand not just the current state of data, but how it evolved.
