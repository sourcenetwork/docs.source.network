---
title: Keys setup
---

DefraDB relies on a number of private keys to encrypt or sign data:

- `peer-key`: ed25519 key.  
Backs [P2P features](/p2p/index.md).
- `encryption-key`: AES-128, AES-192, or AES-256 key.  
Used to encrypt data at rest.
- `searchable-encryption-key`: AES-128, AES-192, or AES-256 key.  
Used to produce searchable encrypted artifacts.
- `node-identity-key`: secp256k1 or ed25519 key (defined by [`datastore.defaultkeytype`](/references/config.md#datastore-defaultkeytype)).  
Used for [access control](/security/document-access-control.md) and signatures.

Keys are stored in the `defradb` keyring, which is initialized and unlocked via the `DEFRA_KEYRING_SECRET` environment variable. The variable can also be defined in a `.env` file located in the working directory, or at a filepath defined by the `--secret-file` flag. The secret must be provided every time the node is started.

The databases provisions keys automatically on startup if they are not found, but you can also generate or import keys manually:

- Generate keys with the CLI command [`defradb keyring new`](/references/cli/defradb_keyring_new.md)
- Import external keys with the CLI command [`defradb keyring add <name> <private-key-hex>`](/references/cli/defradb_keyring_add.md)
