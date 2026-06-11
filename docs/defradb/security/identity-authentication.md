---
title: Identity and authentication
---

## Generate identities {/* #generate-identity */}

Actors are identified via keys, of type either secp256k1 or ed25519. The CLI command [`defradb identity new`](/references/cli/defradb_identity_new.md) allows you to generate new identities. You will need the `PrivateKey` to identify yourself in CLI commands or HTTP requests.

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

## Authentication {/* #auth */}

### CLI commands

To authenticate with an identity when running CLI commands, provide the `PrivateKey` to the `--identity` flag.

```shell title="Example &ndash; Authenticated query"
defradb client query \
# highlight-next-line
  --identity b17a7b973f629b900cf23654db9c4be935f90281707dd3e2cd7a56bdd2c1bf4f \
  '{ Book { _docID title } }'
```

### HTTP requests

HTTP requests are authenticated with an extra header:

```
Authorization: Bearer <jwtToken>
```

The string `<jwtToken>` is a JSON Web Token resulting from the signature of a specific data structure.

```text title="Example &ndash; Authorization header"
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwMzYzZjIyNGJmZGRiNjQxYmQwY2Q0YjU0MDliYzkyMWM0MDU0NjA3MjdmODY0ZjZkYmEzM2RhNWRkN2IwNjFiY2YiLCJhdWQiOiJsb2NhbGhvc3Q6OTE3MSIsImV4cCI6MTUxNjIzOTAyMjAsIm5iZiI6MTUxNjIzOTAsImlhdCI6MTUxNjIzOTAyMn0.KyLjB43k1IJ7VHgZOVFn3HIP71BmrEX1VPYkUzVRVpk
```


### Header
```json title="Example &ndash; Header"
{
  "alg": "HS256",
  "typ": "JWT"
}
```

### Payload
```json title="Example &ndash; Payload"
{
  "sub": "0363f224bfddb641bd0cd4b5409bc921c405460727f864f6dba33da5dd7b061bcf",
  "aud": "localhost:9171",
  "exp": 15162390220,
  "nbf": 15162390
}
```

### Signature

The JWT token is signed with the `PrivateKey` corresponding to the `PublicKey` specified in the `sub` value of the payload.

```text title="Example &ndash; PrivateKey"
b17a7b973f629b900cf23654db9c4be935f90281707dd3e2cd7a56bdd2c1bf4f
```
