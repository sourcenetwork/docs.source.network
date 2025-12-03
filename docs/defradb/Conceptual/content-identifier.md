---
sidebar_label: Content Identifiers (CID)
---

# Content Identifiers (CID)

## Overview

Content Identifiers (CIDs) are foundational in content-addressable storage (CAS) systems, providing a globally unique, self-describing reference to digital content based on its data rather than its location. CIDs enable systems to efficiently and securely retrieve, verify, link, and manage data, enabling immutable and decentralized data storage solutions such as IPFS, IPLD, and DefraDB.

## Why Content Identifiers Matter

Traditional web addresses (URLs) tell you **where** data lives—on a specific server, at a specific location. 

Content Identifiers tell you **what** the data is—a unique fingerprint of the content itself.

This fundamental shift enables:

- **Decentralized architecture:** Any node can serve data, not just the original source
- **Self-verifying data:** Content proves its own integrity through cryptographic hashing
- **Permanent links:** References that never break, even when data moves
- **Automatic deduplication:** The same content always has the same identifier, eliminating redundant storage
- **True data portability:** Content can move freely between platforms while maintaining its identity

This transformation from location-based to content-based addressing is as significant as the shift from IP addresses to domain names—but instead of making locations human-readable, CIDs make content itself addressable.

## Content Identifier Basics

A **CID** uniquely identifies data by combining a cryptographic hash with encoding metadata. This makes a CID:

- **Deterministic:** No randomness—the same input always yields the same CID
- **Consistent across locations:** The same content always produces the same CID
- **Unique:** Different content results in different CIDs
- **Self-describing:** The identifier encodes what the data is and how to verify it

### Understanding Cryptographic Hashes

To understand how CIDs achieve these properties, we first need to understand the cryptographic hashes that power them.

A **cryptographic hash** is a mathematical function that takes input data of any size and transforms it into a fixed-length string of bits, called a hash value or digest. This process is:

- **Deterministic:** The same input always produces the same output
- **Collision-resistant:** Different inputs produce different outputs
- **One-way:** Cannot reverse the hash to get the original data
- **Sensitive:** Even a tiny change in input results in a completely different hash value

Content-Addressable Storage (CAS) uses these cryptographic fingerprints to store and access data, ensuring integrity and enabling efficient deduplication.

### Key CID Properties

| Property | Description | Technical Benefit |
|----------|-------------|-------------------|
| **Immutability** | Any change to content changes the CID | Enables trustless verification |
| **Deduplication** | Same content anywhere yields the same CID | Reduces storage significantly in typical datasets |
| **Integrity verification** | CIDs ensure the authenticity of retrieved data | Cryptographic proof of data integrity |
| **Versioning** | Unique CIDs support tracking content over time | Implicit version control |

## CID Structure

With these fundamentals in place, let's examine how CIDs are actually structured and what each component does.

### Visual Overview

A CID consists of multiple components that work together to create a self-describing content identifier:
```bash
bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi
│ └┬┘└───────────────────────────────────────────────────────┘
│  │                              │
│  │                              └── Base32-encoded multihash
│  └──────────────────────────────── Multicodec (dag-pb)
└──────────────────────────────────── Multibase prefix (b = base32)
```

### Component Breakdown

- **Multibase prefix:** Indicates how the CID is encoded (like choosing between binary and text). This allows CIDs to be represented in different formats for different use cases
- **Multicodec:** Specifies what format the content uses (raw bytes, JSON, CBOR, etc.). This tells systems how to interpret the data
- **Multihash:** Contains the actual cryptographic fingerprint of your content, along with information about which hash function was used

### Technical Components

| Component | Description | Details | Example Values |
|-----------|-------------|---------|----------------|
| **Multibase prefix** | Specifies encoding format | First character(s) of the CID | `b` (base32), `z` (base58btc), `f` (base16) |
| **Multicodec** | Identifies content type/format | Varint-encoded codec identifier | `0x70` (dag-pb), `0x71` (dag-cbor), `0x55` (raw) |
| **Multihash** | Hash function and digest | Function ID + digest length + digest | SHA-256, Blake2b-256, SHA-3 |

### CID Versions

| Version | Details | Example CID | Binary Structure |
|---------|---------|-------------|------------------|
| **CIDv0** | Base58btc encoding, supports only dag-pb and SHA-256 | `QmYwAPJzv5CZsnA...` | `<multihash>` only |
| **CIDv1** | Supports multiple codecs, hash functions, and encodings | `bafybeigdyrzt5sf...` | `<version><codec><multihash>` |
