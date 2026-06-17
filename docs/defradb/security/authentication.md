---
title: Authentication
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

Nobody should mess around with your private jewelry. When [Document Access Control](document-access-control.md) or Node Access Control is enabled on an instance, all requests acting on restricted resources must be authenticated with an [identity's private key](identity.md). The authentication looks different depending on the tool originating the request. 

:::note
The examples on this page use `secp256k1` keys, but the flow is similar for `ed25519` keys.
:::

## CLI commands {/* #cli */}

To authenticate with an identity in CLI commands, provide the actor's `PrivateKey` to the `--identity` flag.

```shell title="Example &ndash; Authenticated query"
defradb client query \
# highlight-next-line
  --identity b17a7b973f629b900cf23654db9c4be935f90281707dd3e2cd7a56bdd2c1bf4f \
  '{ Book { title } }'
```

## HTTP requests {/* #http */}

HTTP requests are authenticated with an extra header:

```
Authorization: Bearer <jwtToken>
```

where `<jwtToken>` is a [JSON Web Token](https://www.rfc-editor.org/info/rfc7519), composed of header, payload, and signature parts, each separated by a dot `.`:

<div class="codeBlockTitle_OeMC" style={{ backgroundColor: "var(--code-background)" }}>JWT token structure</div>
<pre style={{ textWrap: "wrap" }}>
  <span style={{ color: "#c86834ff" }}>\<header></span>.<span style={{ color: "#8767deff" }}>\<payload></span>.<span style={{ color: "#4cb7a3" }}>\<signature></span> 
</pre>

<div class="codeBlockTitle_OeMC" style={{ backgroundColor: "var(--code-background)" }}>Example &ndash; JWT token</div>
<pre style={{ textWrap: "wrap" }}>
  <span style={{ color: "#c86834ff" }}>eyJhbGciOiJFUzI1NksiLCJ0eXAiOiJKV1QifQ</span>.<span style={{ color: "#8767deff" }}>eyJhdWQiOlsiMTI3LjAuMC4xOjkxODEiXSwiZXhwIjoxNzgxNTk5MzAyLCJpYXQiOjE3ODE1OTg0MDIsImlzcyI6ImRpZDprZXk6ejdyOG9xVWNTbTZ4d3d4ZnBCWjVSNkNXUWlQUm5ZcFhvdXdnZVhrYldnVmNXQkYxOVFEbmRCQld6Z0hjdnZIaGFVZTdxY1R6N2F5SlZYa3NORDM3cnZWN0dBVUF2Iiwia2V5X3R5cGUiOiJzZWNwMjU2azEiLCJuYmYiOjE3ODE1OTg0MDIsInN1YiI6IjAzNjNmMjI0YmZkZGI2NDFiZDBjZDRiNTQwOWJjOTIxYzQwNTQ2MDcyN2Y4NjRmNmRiYTMzZGE1ZGQ3YjA2MWJjZiJ9</span>.<span style={{ color: "#4cb7a3" }}>n9QbkwnpvcGOBo4aRRnOP-gANBQNAtNx3y428On3fhNxSh42Al1pNm5m9DvyTTjYOS6ZIwK2ECm6pxqwOAGtcg</span> 
</pre>

JWT tokens are not scoped to specific actions, so anybody with a valid token can run any action that the signing identity has permission to execute.

HTTP requests carrying an invalid JWT token result in a `403 Forbidden` HTTP status code.

### Header

```json title="Example &ndash; Header"
{
  "alg": "HS256K",
  "typ": "JWT"
}
```

Valid values for `alg` are: `HS256K`, `EdDSA`. The algorithm must match the [identity](identity.md) key type. Most tools implicitly craft the header object for you basing on the signing algorithm.

### Payload

```json title="Example &ndash; Payload"
{
  "sub": "0363f224bfddb641bd0cd4b5409bc921c405460727f864f6dba33da5dd7b061bcf",
  "aud": "localhost:9181",
  "exp": 1781536870,
  "nbf": 1781532870,
  "key_type": "secp256k1"
}
```

- `sub` &ndash; Identity's `PublicKey`, in hex format.
- `aud` &ndash; Hostname(s) of the DefraDB HTTP API the token is allowed with. String or list of strings.
- `exp` &ndash; Token expiration UNIX timestamp.
- `nbf` &ndash; `not-before` UNIX timestamp (token invalid before that time).
- `key_type` &ndash; The key type must match the [identity](identity.md) key type. Valid values: `secp256k1`, `ed25519`.

:::note
For policies hosted on SourceHub, more fields are required in the payload:

- `iss` &ndash; Identity's DID key.
- `iat` &ndash; Current UNIX timestamp.
- `authorized_account` &ndash; SourceHub address of the account signing transactions on your behalf (a `Bech32` address with a specific SourceHub prefix).
:::

### Signature

The JWT token is signed with the `PrivateKey` corresponding to the `PublicKey` specified in the payload `sub` field.

```text title="Example &ndash; PrivateKey"
b17a7b973f629b900cf23654db9c4be935f90281707dd3e2cd7a56bdd2c1bf4f
```

### Generate tokens programmatically

<Tabs groupId="lang">
  <TabItem value="python" label="Python" default>
    This example uses the PyJWT and cryptography libraries. The function [`jwt.encode()`](https://pyjwt.readthedocs.io/en/latest/api.html#jwt.encode) produces a JWT token; however, because that requires a PEM-encoded version of the private key, the function [`ec.derive_private_key()`](https://cryptography.io/en/latest/hazmat/primitives/asymmetric/ec/#cryptography.hazmat.primitives.asymmetric.ec.derive_private_key) reads the key into an elliptic curve object and the method `.private_bytes()` outputs the private key in the requested bytes, PEM-encoded format.

```python
import jwt
import time

from cryptography.hazmat.primitives.asymmetric import ec
from cryptography.hazmat.primitives.serialization import NoEncryption, PrivateFormat
from cryptography.hazmat.primitives.serialization import Encoding

pub_hex = '0363f224bfddb641bd0cd4b5409bc921c405460727f864f6dba33da5dd7b061bcf'
priv_hex = 'b17a7b973f629b900cf23654db9c4be935f90281707dd3e2cd7a56bdd2c1bf4f'
now = int(time.time())

payload = {
    "sub": pub_hex,
    "aud": ["127.0.0.1:9181", "localhost:9181"],
    "exp": now + 60*60,  # valid for an hour
    "nbf": now - 30,
    "key_type": "secp256k1",
}

# Convert hex-encoded private key into PEM-encoded bytes
priv_int = int(priv_hex, 16)
priv_ec = ec.derive_private_key(priv_int, ec.SECP256K1())
priv_bytes = priv_ec.private_bytes(
    encoding=Encoding.PEM, format=PrivateFormat.PKCS8, encryption_algorithm=NoEncryption()
)

token = jwt.encode(payload, priv_bytes, algorithm='ES256K')
print('token:', token)
```
  </TabItem>
  <TabItem value="go" label="Go">
  This example uses DefraDB public helpers to create a JWT token from a hex-encoded private key.

```go
package main

import (
    "fmt"
    "strings"
    "time"

    "github.com/sourcenetwork/immutable"

    "github.com/sourcenetwork/defradb/acp/identity"
    "github.com/sourcenetwork/defradb/crypto"
)

func main() {
    const privHex = "b17a7b973f629b900cf23654db9c4be935f90281707dd3e2cd7a56bdd2c1bf4f"
    const aud = "127.0.0.1:9181"

    priv, err := crypto.PrivateKeyFromString(crypto.KeyTypeSecp256k1, privHex)
    if err != nil {
        panic(err)
    }

    ident, err := identity.FromPrivateKey(priv)
    if err != nil {
       panic(err)
    }

    if err := ident.UpdateToken(60*time.Minute, immutable.Some(aud), immutable.None[string]()); err != nil {
       panic(err)
    }

    if err := identity.VerifyAuthToken(ident, aud); err != nil {
       panic(err)
    }

    token := ident.BearerToken()
    fmt.Println("token:", token)
}
```
  </TabItem>
</Tabs>
