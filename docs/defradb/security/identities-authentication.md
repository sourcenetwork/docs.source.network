---
title: Identities and authentication
---

## Authentication {/* #auth */}

`--identity` for cli, `Authorization: Bearer <JWTtoken>` for http

## Generate identities {/* #generate-identity */}

Actors are identified via keys, of type either secp256k1 or ed25519. The CLI command [`defradb identity new`](/references/cli/defradb_identity_new.md) allows you to generate new identities. You will need the `PrivateKey` to identify yourself in all commands or queries involving documents under DAC.

You can think of actors identity keys as users authentication credentials. But hey, DefraDB is a discrimination-free database &ndash; who says that _users_ are the only entities accessing the database? Whales act too.

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
