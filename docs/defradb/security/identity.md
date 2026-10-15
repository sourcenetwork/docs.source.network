---
title: Identities
description: Identity keys are hex-encoded and identify actors. The keys authenticate all CLI/HTTP requests when Document/Node Access Control is enabled.
---

Identities keys are the digital IDs that identify _actors_. You can think of actors identity keys as users authentication credentials. But hey, DefraDB is a discrimination-free database &ndash; who says that _users_ are the only entities acting on the database? Whales act too.

In DefraDB, identity keys are hex-encoded, of type either `secp256k1` or `ed25519`. The keys [authenticate](authentication.md) all CLI/HTTP requests when [Document Access Control](document-access-control.md) or Node Access Control is enabled.

## Generate identities {/* #generate-identity */}

Generate a new identity with the CLI command [`defradb identity new`](/references/cli/defradb_identity_new.md). You will need the `PrivateKey` to [authenticate](authentication.md) in CLI commands and HTTP requests, whereas the `DID` key is the identity's public identifier.

```shell
defradb identity new
```
```json result
{
  "PrivateKey": "b17a7b973f629b900cf23654db9c4be935f90281707dd3e2cd7a56bdd2c1bf4f",
  "PublicKey": "0363f224bfddb641bd0cd4b5409bc921c405460727f864f6dba33da5dd7b061bcf",
  "DID": "did:key:z7r8oqUcSm6xwwxfpBZ5R6CWQiPRnYpXouwgeXkbWgVcWBF19QDndBBWzgHcvvHhaUe7qcTz7ayJVXksND37rvV7GAUAv",
  "KeyType": "secp256k1"
}
```

## Retrieve node identity {/* #retrieve-node-identity */}

When you [start a node](./install.md#start) for the first time, an identity is automatically created (from which [the node's private keys](./references/private-keys.md) are derived). You can extract both public and private keys on an existing node.

### Public key

<Tabs groupId="defra">
  <TabItem value="cli" label="CLI" default>
    Retrieve a node's identity with the CLI command [`defradb client node-identity`](references/cli/defradb_client_node-identity.md). The node must be online.

    ```shell
    defradb client node-identity
    ```
    ```json result
    {
      "PublicKey": "0363f224bfddb641bd0cd4b5409bc921c405460727f864f6dba33da5dd7b061bcf",
      "DID": "did:key:z7r8oqUcSm6xwwxfpBZ5R6CWQiPRnYpXouwgeXkbWgVcWBF19QDndBBWzgHcvvHhaUe7qcTz7ayJVXksND37rvV7GAUAv"
    }
    ```
  </TabItem>
  <TabItem value="http" label="HTTP API">
    Retrieve a node's identity by submitting a `GET` request to the HTTP endpoint [`/node/identity`](/defradb/references/http/api/get-node-identity/). The request doesn't need to be authenticated. The node must be online.

    ```http 
    GET http://localhost:9181/node/identity HTTP/2
    accept: application/json
    ```
    ```json result
    {
      "PublicKey": "0363f224bfddb641bd0cd4b5409bc921c405460727f864f6dba33da5dd7b061bcf",
      "DID": "did:key:z7r8oqUcSm6xwwxfpBZ5R6CWQiPRnYpXouwgeXkbWgVcWBF19QDndBBWzgHcvvHhaUe7qcTz7ayJVXksND37rvV7GAUAv"
    }
    ```
  </TabItem>
</Tabs>

### Private keys

List a node's available [private keys](./references/private-keys.md) with the CLI command [`defradb keyring list`](references/cli/defradb_keyring_list.md). The keyring is sourced from the default root directory, unless a different path is given with the option `--rootdir`.

```shell title="List available private keys"
defradb keyring list
```
```text result
Keys in the keyring:
- encryption-key
- node-identity-key
- peer-key
- searchable-encryption-key
```

Retrieve any of the listed private keys with the CLI command [`defradb keyring get <key-name>`](references/cli/defradb_keyring_get.md). The node doesn't have to be online, but the [keyring's secret](references/keys.md#keyring) must be provided.

```shell title="Export the node's peer-key"
defradb keyring get peer-key
```
```text result
0b0201e3c3f15aa4cd2a0d8e287f2d6a38d644474898268e89fd43d67540758214a2b8208c315d3cab9d3f73071213e2ccd17bd64b48b67e2610a94a7971c5c5
```