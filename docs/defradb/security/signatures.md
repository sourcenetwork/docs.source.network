---
title: Signatures
---

Signatures allow you to track _who_ did _which_ changes, for every document.
In the cruel life out there, anybody can trip you up and deny it was them, or alter the content of your files and deny any involvement. In DefraDB, each change is not only logged as a [commit block](time-travel.md), but also signed with the [actor's identity](security/identity.md) responsible of the database mutation.

## Signature object {/* #signature-obj */}

The `signature` object is available for every commit object:

```graphql
type Signature {
    identity: String,
    type: String,
    value: String
}
```

- `identity` &ndash; Public key of the signing [identity](security/identity.md).
- `type` &ndash; Type of key used for signing.
- `value` &ndash; Signature value.

```json title='Example signature'
"signature": {
  "identity": "023531430d1053f4eeab4bf520522186698d7e16d53cf0e80df35a158c7a74261e",
  "type": "ES256K",
  "value": "MEUCIQDd0qjbTLAWH2egv3qMKE7afW8O/Ki1Wgum2bwBP/ziHAIgBBtDcYgqdBCUs1P+pV2ZYr/awSd10FkXiGCPKCDk944="
}
```

## Verify a block's signature {/* #verify */}

<Tabs groupId="defra">
  <TabItem value="cli" label="CLI" default>
    You can verify that the signature is valid for a block with the CLI command [`defradb client block verify-signature <public-key> <cid>`](references/cli/defradb_client_block_verify-signature.md).

    ```shell title='Verify signature for a commit block'
    defradb client block verify-signature 023531430d1053f4eeab4bf520522186698d7e16d53cf0e80df35a158c7a74261e bafyreidapjfuskkddbuu5eevkf5usgv6biot7dqlmxau7g5copqr2ax6ha
    ```
    ```text result
    Block's signature verified
    ```
  </TabItem>
  <TabItem value="http" label="HTTP API">
    You can verify that the signature is valid for a block by submitting a `GET` request to the HTTP endpoint [`/block/verify-signature`](/defradb/references/http/api/verify-block/), providing `public-key` and `cid` as parameters. The request doesn't need to be authenticated. Successful verification yields no output.

    ```http
    GET http://localhost:9181/block/verify-signature?public-key=<public-key>&cid=<cid> HTTP/2
    accept: application/json
    ```
  </TabItem>
</Tabs>

:::note
At `height > 1`, only composite blocks are signed. Field blocks are only signed at `height = 1` to seed entropy for the upcoming chain of commits. There's no cryptographic need to sign field blocks at every height; signing composites is enough to guarantee integrity.
:::