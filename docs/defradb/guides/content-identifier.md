---
sidebar_label: Content Identifier Guide
sidebar_position: 80
---

# Content Identifiers (CID)

## Overview

A Content Identifier (CID) is a self-describing, unique reference to content in content-addressable systems. CIDs are used to retrieve, verify, and link data by its content rather than its location. This page provides a technical overview for developers working with CIDs in distributed systems.

## CID fundamentals

A CID is a value that uniquely identifies a piece of content by its cryptographic hash. This approach ensures:

- **Immutability:** The content cannot be changed without changing its CID.
- **Deduplication:** Identical content always has the same CID, regardless of where it is stored.
- **Integrity:** The CID can be used to verify that the retrieved content matches the original.

CIDs are foundational in systems like IPFS, IPLD, and other decentralized storage protocols.

## Structure and versions

CIDs are composed of several parts, making them self-describing and extensible. Main components are:

- **Multibase prefix:** Indicates the encoding (e.g., base32, base58btc).
- **Multicodec:** Specifies the content type or format (e.g., dag-pb, dag-cbor).
- **Multihash:** Identifies the hash function used (e.g., SHA-256) and contains the hash digest.

### Versions

- **CIDv0:** Uses base58btc encoding, supports only dag-pb and SHA-256. Example:

  ```bash
  QmYwAPJzv5CZsnAzt8auVZRnG7f3z25bG7r3Q1b6v7F5rG
  ```

- **CIDv1:** Supports multiple encodings and codecs, is more flexible. Example:

  ```bash
  bafybeigdyrztjqfvxahsfof2t6o2mgzd7ytkdg3iahcmyxw5bg6l5yzx4m
  ```

## Generating and Using CIDs

### Generating a CID

1. Select a hash function (e.g., SHA-256).
2. Hash the content to produce a digest.
3. Combine the multibase, multicodec, and multihash to form the CID.

#### Example (using IPFS CLI)

```shell
ipfs add hello.txt
```

This command outputs a CID for the file `hello.txt`.

### Using a CID

- **Retrieving content:**

  ```shell
  ipfs cat <cid>
  ```

- **Linking data:** CIDs can be embedded in other data structures to reference content.

### Validating a CID

Libraries in Go, JavaScript, and other languages can parse and validate CIDs, allowing you to inspect their components and verify their integrity.

## CIDs in Practice

- **Data retrieval:** Fetch content from any node in the network using its CID.
- **Deduplication:** Store only unique content, as identical data shares the same CID.
- **Versioning:** Changes to content result in new CIDs, enabling immutable version histories.
- **Troubleshooting:** If a CID does not resolve, check for encoding errors, content changes, or network availability.
