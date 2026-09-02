---
title: Identities
description: Identity keys are hex-encoded and identify actors. The keys authenticate all CLI/HTTP requests when Document/Node Access Control is enabled.
---

Identities keys are the digital IDs that identify _actors_. You can think of actors identity keys as users authentication credentials. But hey, DefraDB is a discrimination-free database &ndash; who says that _users_ are the only entities acting on the database? Whales act too.

In DefraDB, identity keys are hex-encoded, of type either `secp256k1` or `ed25519`. The keys [authenticate](authentication.md) all CLI/HTTP requests when [Document Access Control](document-access-control.md) or Node Access Control is enabled.

## Generate identities {/* #generate-identity */}

Generate a new identity with the CLI command [`defradb identity new`](/references/cli/defradb_identity_new.md). You will need the `PrivateKey` to [authenticate](authentication.md) in CLI commands and HTTP requests.

```shell
defradb identity new
```
```json
{
  "PrivateKey": "b17a7b973f629b900cf23654db9c4be935f90281707dd3e2cd7a56bdd2c1bf4f",
  "PublicKey": "0363f224bfddb641bd0cd4b5409bc921c405460727f864f6dba33da5dd7b061bcf",
  "DID": "did:key:z7r8oqUcSm6xwwxfpBZ5R6CWQiPRnYpXouwgeXkbWgVcWBF19QDndBBWzgHcvvHhaUe7qcTz7ayJVXksND37rvV7GAUAv",
  "KeyType": "secp256k1"
}
```