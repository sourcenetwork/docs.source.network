---
sidebar_label: Content Identifiers (CID)
sidebar_position: 90
---

# Content Identifiers (CID)

## Overview

Content Identifiers (CIDs) are foundational in content-addressable storage (CAS) systems, providing a globally unique, self-describing reference to digital content based on its data rather than its location. CIDs allow systems to retrieve, verify, link, and manage data efficiently and securely, enabling immutable and decentralized data storage solutions such as IPFS, IPLD, and DefraDB.

## Why Content Identifiers Matter

Traditional web addresses (URLs) tell you where data lives—on a specific server, at a specific location. Content Identifiers tell you what the data is—a unique fingerprint of the content itself. This fundamental shift enables:

- Decentralized architecture: Any node can serve data, not just the original source
- Self-verifying data: Content proves its own integrity through cryptographic hashing
- Permanent links: References that never break, even when data moves
- Automatic deduplication: The same content always has the same identifier, eliminating redundant storage
- True data portability: Content can move freely between platforms while maintaining its identity

This transformation from location-based to content-based addressing is as significant as the shift from IP addresses to domain names—but instead of making locations human-readable, CIDs make content itself addressable.

## Content Identifier (CID) Basics

A CID uniquely identifies data by incorporating a cryptographic hash of the content alongside metadata about the encoding and hashing method used. This makes a CID:

- **Deterministic**: No randomness—the same input always yields the same CID
- **Consistent across locations**: The same content always produces the same CID
- **Unique**: Different content results in different CIDs
- **Self-describing**: The identifier encodes what the data is and how to verify it

### Understanding Cryptographic Hashes

A cryptographic hash is a mathematical function that takes input data of any size and transforms it into a fixed-length string of bits, called a hash value or digest. This process is:

- **Deterministic**: The same input always produces the same output
- **Collision-resistant**: Different inputs produce different outputs (with astronomical probability)
- **One-way**: Cannot reverse the hash to get the original data
- **Sensitive**: Even a tiny change in input results in a completely different hash value

Content-Addressable Storage (CAS) uses these cryptographic fingerprints to store and access data, ensuring integrity and enabling efficient deduplication.

### Key CID Properties

| Property | Description | Technical Benefit |
|----------|-------------|-------------------|
| **Immutability** | Any change to content changes the CID | Enables trust without central authority |
| **Deduplication** | Same content anywhere yields the same CID | Reduces storage by ~30-50% in typical datasets |
| **Integrity verification** | CIDs ensure the authenticity of retrieved data | Cryptographic proof of data integrity |
| **Versioning** | Unique CIDs support tracking content over time | Natural version control system |

## Understanding CID Structure

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

### What Each Part Does

- **Multibase prefix**: Indicates how the CID is encoded (like choosing between binary and text). This allows CIDs to be represented in different formats for different use cases
- **Multicodec**: Specifies what format the content uses (raw bytes, JSON, CBOR, etc.). This tells systems how to interpret the data
- **Multihash**: Contains the actual cryptographic fingerprint of your content, along with information about which hash function was used

### Example: How CID Changes with Content

```javascript
// Example showing how even a tiny change creates a different CID using IPLD

import { CID } from 'multiformats/cid'
import * as Block from 'multiformats/block'
import { sha256 } from 'multiformats/hashes/sha2'
import * as raw from 'multiformats/codecs/raw'

async function demonstrateCIDUniqueness() {

  // Original content
  const content1 = new TextEncoder().encode("Hello, World!");
  const block1 = await Block.encode({
    value: content1,
    codec: raw,
    hasher: sha256
  });
  console.log("Original CID:", block1.cid.toString());

  // Output: bafkreigaknpexyvxt76zgkitavbwx6ejgfheup5oybpm77f3pxzrvwpfdi
  
  // Slightly modified content (added a space)

  const content2 = new TextEncoder().encode("Hello, World! ");
  const block2 = await Block.encode({
    value: content2,
    codec: raw,
    hasher: sha256
  });
  console.log("Modified CID:", block2.cid.toString());

  // Output: bafkreifjjcie6lypi6ny7amxnfftagclbuxndqonfipmb64f2km2devei4
  
  // Completely different CIDs for slightly different content
}
```

## CID Structure

CIDs are composed of several parts:

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

### Version Comparison Code

```go
package main

import (
    "fmt"
    "github.com/ipfs/go-cid"
    mh "github.com/multiformats/go-multihash"
)

func compareCIDVersions() {
    // Create the same content hash
    data := []byte("Hello IPFS!")
    hash, _ := mh.Sum(data, mh.SHA2_256, -1)
    
    // CIDv0
    cidV0 := cid.NewCidV0(hash)
    fmt.Printf("CIDv0: %s\n", cidV0.String())
    // Output: QmWATWQ7fVPP2EFGu71UkfnqhYXDYH566qy47CnJDgvs8u
    
    // CIDv1
    cidV1 := cid.NewCidV1(cid.DagProtobuf, hash)
    fmt.Printf("CIDv1: %s\n", cidV1.String())
    // Output: bafybeie5745rpv2m6tjyuugywy4d5ewrqgqqhfnf445he3omzpjbx5xqxe
}
```

## Generating and Using CIDs

### Generating a CID - Step by Step

1. **Select a hash function** (e.g., SHA-256)
2. **Hash the content** to produce a digest
3. **Combine** the multibase, multicodec, and multihash to form the CID

### Complete CID Generation Example

```python
import hashlib
import multihash
import multibase
import multicodec

def generate_cid_v1(data: bytes) -> str:
    """
    Generate a CIDv1 for given data
    
    Args:
        data: The content to generate a CID for
    
    Returns:
        A CIDv1 string
    """
    # Step 1: Hash the data
    hash_digest = hashlib.sha256(data).digest()
    
    # Step 2: Create a multihash (0x12 = sha2-256)
    mh = multihash.encode(hash_digest, 'sha2-256')
    
    # Step 3: Add CID version (0x01) and codec (0x70 for dag-pb)
    version = b'\x01'
    codec = multicodec.get_prefix('dag-pb')
    cid_bytes = version + codec + mh
    
    # Step 4: Encode with multibase (base32)
    cid_string = multibase.encode('base32', cid_bytes)
    
    return cid_string.decode('utf-8')

# Example usage
content = b"Hello, distributed web!"
cid = generate_cid_v1(content)
print(f"Generated CID: {cid}")
```

### Linking Data with CIDs

```javascript
// Creating a Merkle DAG structure using IPLD concepts

import { CID } from 'multiformats/cid'
import * as Block from 'multiformats/block'
import { sha256 } from 'multiformats/hashes/sha2'
import * as dagCBOR from '@ipld/dag-cbor'

const createLinkedData = async () => {
  
  // Create individual data blocks
  const doc1Data = { 
    content: 'First document content',
    type: 'document'
  };
  
  const doc2Data = { 
    content: 'Second document content',
    type: 'document'
  };

  // Encode and hash the first document
  const block1 = await Block.encode({
    value: doc1Data,
    codec: dagCBOR,
    hasher: sha256
  });

  // Encode and hash the second document
  const block2 = await Block.encode({
    value: doc2Data,
    codec: dagCBOR,
    hasher: sha256
  });

  // Create a parent structure that links to the documents via their CIDs
  const directory = {
    documents: {
      document1: block1.cid,  // Link to first document via CID
      document2: block2.cid   // Link to second document via CID
    },
    metadata: {
      created: new Date().toISOString(),
      version: '1.0.0'
    }
  };

  // Encode the directory structure
  const rootBlock = await Block.encode({
    value: directory,
    codec: dagCBOR,
    hasher: sha256
  });

  console.log('Root CID:', rootBlock.cid.toString());
  console.log('Document 1 CID:', block1.cid.toString());
  console.log('Document 2 CID:', block2.cid.toString());

  // The directory's CID can be used to retrieve and traverse the structure
  
  // Each CID is a cryptographic hash of its content
  
  return {
    rootCID: rootBlock.cid,
    blocks: [rootBlock, block1, block2]
  };
};
```

### Validating a CID

Understanding and verifying CIDs is critical for data integrity:

```javascript
const CID = require('cids');
const multihash = require('multihashes');

async function validateCID(cidString, expectedContent) {
  try {
    // Step 1: Parse the CID
    const cid = new CID(cidString);
    
    // Step 2: Extract components
    console.log('Version:', cid.version);
    console.log('Codec:', cid.codec);
    console.log('Multibase:', cid.multibaseName);
    
    // Step 3: Decode the multihash
    const decoded = multihash.decode(cid.multihash);
    console.log('Hash function:', decoded.name);
    console.log('Hash length:', decoded.length);
    
    // Step 4: Verify content matches CID
    const crypto = require('crypto');
    const contentHash = crypto.createHash('sha256')
      .update(expectedContent)
      .digest();
    
    const expectedMh = multihash.encode(contentHash, 'sha2-256');
    
    if (Buffer.compare(expectedMh, cid.multihash) === 0) {
      console.log('✓ Content validates against CID');
      return true;
    } else {
      console.log('✗ Content does not match CID');
      return false;
    }
  } catch (error) {
    console.error('Invalid CID:', error.message);
    return false;
  }
}

// Usage example
const isValid = await validateCID(
  'bafkreigaknpexyvxt76zgkitavbwx6ejgfheup5oybpm77f3pxzrvwpfdi',
  'Hello, World!'
);
```

Libraries like multiformats help developers validate and manipulate CIDs programmatically.

