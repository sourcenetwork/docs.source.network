---
title: Keys setup
---


### Initial keys setup

DefraDB provides a keyring for storing private keys securely. The following keys are loaded from the keyring on start:

- `peer-key` -- ed25519 key (required)
- `encryption-key` -- AES-128, AES-192, or AES-256 key (optional)
- `node-identity-key` -- secp256k1 or ed25519 key (optional; type defined by [`datastore.defaultkeytype`](/references/config.md#datastoredefaultkeytype)). If not found, it will be randomly generated when a node is started. This key establishes the node's identity, and is used to exchange encryption keys with other nodes.

You generate keys via the [`keyring new` command](/references/cli/defradb_keyring_new.md). By default, keys are stored in the `defradb` keyring under the secret `secret`. You can initialize the keyring with a different secret via the `DEFRA_KEYRING_SECRET` environment variable, via a `.env` file located in the working directory, or via a file at a path defined by the `--secret-file` flag. **You will need to provide the secret every time you start the node.**

```shell
DEFRA_KEYRING_SECRET=<secret> defradb keyring new
```

Instead of generating new keys, you can also import external keys:

```shell
defradb keyring add <name> <private-key-hex>
```
