---
sidebar_label: Merkle CRDTs
sidebar_position: 30
---
# A Guide to Merkle CRDTs in DefraDB

## Overview

Merkle CRDTs are a type of Conflict-free Replicated Data Type (CRDT). They are designed to support independent updates across multiple peers and to merge those updates automatically without conflicts. The goal is to achieve deterministic, automatic data synchronization while maintaining consistency. [CRDTs](https://en.wikipedia.org/wiki/Conflict-free_replicated_data_type) were first formalized in 2011 and have become an important tool in distributed computing. This approach is particularly useful in distributed applications where data must be updated and merged consistently across many actors, such as peer-to-peer networks or offline-first systems.

## Concepts

### Regular CRDTs

Conflict-free Replicated Data Types (CRDTs) allow peers to collaborate and update data structures without explicit synchronization. They can be applied to registers, counters, sets, lists, maps, and much more.

The key feature of CRDTs is deterministic merging. In other words, they always merge updates in a predictable way. No matter the order in which updates arrive, all peers eventually agree on the same final state. To make this possible, CRDTs keep track of when events happen, often using logical or vector clocks. These clocks store metadata for each peer, but this becomes inefficient when the number of peers is very large or constantly changing.

### Limitations with Ordering

In distributed systems, it is difficult to know the exact order of events across different machines. System clocks may not match, or they can even be manipulated, which leads to inconsistencies.

Merkle CRDTs solve this by building causality directly into the structure of a Merkle Directed Acyclic Graph (Merkle DAG). This removes the need to maintain separate metadata for every peer, making the system more scalable.

## Formalization of Merkle CRDTs

A Merkle CRDT is built by combining a Merkle clock with a standard CRDT. The Merkle DAG ensures causality through its structure: every node includes the hash of its parent, so a new node cannot exist without its predecessor. This creates a verifiable, tamper-resistant chain of updates.

Merkle CRDT includes:

- **Merkle clock** – provides causality and ordering of events.
- **Embedded CRDT** – manages the type of data structure and the rules for merging updates.  

### Merkle Clock

A Merkle clock uses the properties of Merkle DAGs, similar to blockchains. Each new node contains the identifier of its parent, creating a cryptographically verifiable chain of events that cannot be altered without detection.

Each node also records a height value, which acts like a counter. This makes it easier to tell whether one event happened before, after, or at the same time as another.

With these properties, a Merkle clock ensures that causality is always preserved and that the history of updates cannot be forged or tampered with.

## Delta State Semantics

There are two main ways to represent changes in CRDTs: operation-based and state-based.

- **Operation-based CRDTs** send the intent of an action as the message. For example, “set the value to 10” or “increment the counter by 4.” These messages are usually small because they only contain the operation being performed.  
- **State-based CRDTs** send the full resulting state as the message. For example, to set a value to 10, the message would contain the value 10 as the content. These messages are larger because they include both the current state and the change.

Both approaches work, but each has trade-offs. Operation-based CRDTs are compact but depend on reliable delivery of every operation. State-based CRDTs are easier to reason about but become inefficient as the state grows.

**Delta State CRDTs** combine the strengths of both. Instead of sending either the full operation or the full state, they only send the minimum change needed to move from one state to another. This small change is called a delta.

For example, if there is a set of nine fruit names and you add “banana,” the delta message contains only the word “banana.” It does not resend the entire set of ten fruits. In this way, the message is as small as an operation-based CRDT but still captures the actual difference in state, like a state-based CRDT.

This hybrid model is efficient and expressive, making it a practical choice for distributed systems where both bandwidth and consistency are important.

## Branching and Merging

Merkle CRDTs naturally support branching. When two peers update the same ancestor independently, their updates form separate branches. Each peer treats its branch as the main state, without requiring immediate resolution. This makes the system ideal for offline-first applications.

Merging occurs when branches are brought back together. A merge node is created with multiple parents, and the embedded CRDT defines how to resolve differences between the branches. The Merkle clock ensures that the process respects causality, while the CRDT ensures that the merged state is valid and consistent.
