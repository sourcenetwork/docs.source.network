---
title: Restrict node management operations
description: Set up Node Access Control to restrict who is allowed to perform administration operations on the instance.
toc_max_heading_level: 2
---

Node operations are gated by Node Access Control (NAC). When NAC is enabled, all instance management requests must be [authenticated](authentication.md) and only allowed [actors](identity.md) will be able to perform administration operations on the instance.

## Enable NAC {/* #enable */}

Node Access Control is disabled by default. To enable it, start the instance with the `--node-acp-enable` flag and provide an [identity's private key](identity.md) to the `--identity` flag. The given identity will be registered as the instance administrator.

```shell title="Start DefraDB with Node Access Control enabled"
defradb start --node-acp-enable --identity b17a7b973f629b900cf23654db9c4be935f90281707dd3e2cd7a56bdd2c1bf4f
```

After the first time NAC is enabled, further attempts to enable it on startup (possibly with a different identity) are ignored.

## Disable NAC {/* #disable */}

You can temporarily disable NAC with either the CLI command [`defradb client acp node disable`](/references/cli/defradb_client_acp_node_disable.md) or the HTTP endpoint [`/acp/node/disable`](/defradb/references/http/api/nac-disable/). All NAC checks are suspended while NAC is disabled, so any actor will be able to perform any operation.

<Tabs groupId="defra">
  <TabItem value="cli" label="CLI" default>
   ```shell title="Disable Node Access Control"
    defradb client acp node disable \
      --identity b17a7b973f629b900cf23654db9c4be935f90281707dd3e2cd7a56bdd2c1bf4f
    ```
    ```json title="Result"
    {
      "success": true
    }
    ```
  </TabItem>
  <TabItem value="http" label="HTTP API">
    ```http title="Disable Node Access Control"
    POST http://localhost:9181/api/v1/acp/node/disable HTTP/2
    accept: application/json
    authorization: Bearer <jwtToken>
    ```
    ```json title="Result"
    {
      "success": true
    }
    ```
  </TabItem>
</Tabs>

## Show NAC status {/* #show-status */}

You can show the current NAC status with either the CLI command [`defradb client acp node status`](/references/cli/defradb_client_acp_node_status.md) or the HTTP endpoint [`/acp/node/status`](/defradb/references/http/api/nac-status/).

<Tabs groupId="defra">
  <TabItem value="cli" label="CLI" default>
   ```shell title="Show Node Access Control status"
    defradb client acp node status \
      --identity b17a7b973f629b900cf23654db9c4be935f90281707dd3e2cd7a56bdd2c1bf4f
    ```
    ```json title="Result"
    {
      "Status": "disabled temporarily"
    }
    ```
  </TabItem>
  <TabItem value="http" label="HTTP API">
    ```http title="Show Node Access Control status"
    GET http://localhost:9181/api/v1/acp/node/status HTTP/2
    accept: application/json
    authorization: Bearer <jwtToken>
    ```
    ```json title="Result"
    {
      "Status": "disabled temporarily"
    }
    ```
  </TabItem>
</Tabs>

## Re-enable NAC {/* #re-enable */}

If NAC gets [disabled](#disable) after it had been enabled, you can re-enable it with either the CLI command [`defradb client acp node re-enable`](/references/cli/defradb_client_acp_node_re-enable.md) or the HTTP endpoint [`/acp/node/re-enable`](/defradb/references/http/api/nac-re-enable/). Only admins are allowed to re-enable NAC.

<Tabs groupId="defra">
  <TabItem value="cli" label="CLI" default>
   ```shell title="Re-enable Node Access Control"
    defradb client acp node re-enable \
      --identity b17a7b973f629b900cf23654db9c4be935f90281707dd3e2cd7a56bdd2c1bf4f
    ```
    ```json title="Result"
    {
      "success": true
    }
    ```
  </TabItem>
  <TabItem value="http" label="HTTP API">
    ```http title="Re-enable Node Access Control"
    POST http://localhost:9181/api/v1/acp/node/re-enable HTTP/2
    accept: application/json
    authorization: Bearer <jwtToken>
    ```
    ```json title="Result"
    {
      "success": true
    }
    ```
  </TabItem>
</Tabs>

## Grant permissions {/* #grant-permissions */}

You can make another actor an administrator on an instance with either the CLI command [`defradb client acp node relationship add`](/references/cli/defradb_client_acp_node_relationship_add.md) or the HTTP endpoint [`/api/v1/acp/node/relationship`](/defradb/references/http/api/nac-relationship-add/). Target actors are identified by their `DID` key.

<Tabs groupId="defra">
  <TabItem value="cli" label="CLI" default>
   ```shell title="Grant another actor the admin relation"
    defradb client acp node relationship add \
	  --relation admin \
      --actor did:key:z7r8osuVyok8SVnHH5tsyNDRGyniu9pQoqBt7misXTEJAon5vYCt72NmFpya4NUiLjPfyDvvayNMbYRrnqLMYjpD1cAgp \
      --identity b17a7b973f629b900cf23654db9c4be935f90281707dd3e2cd7a56bdd2c1bf4f
    ```
    ```json title="Result"
    {
      "ExistedAlready": false
    }
    ```
  </TabItem>
  <TabItem value="http" label="HTTP API">
    ```http title="Grant another actor the admin relation"
    POST http://localhost:9181/api/v1/acp/node/relationship HTTP/2
    accept: application/json
    authorization: Bearer <jwtToken>
    content-type: application/json

    {
      "Relation": "admin",
      "TargetActor": "did:key:z7r8osuVyok8SVnHH5tsyNDRGyniu9pQoqBt7misXTEJAon5vYCt72NmFpya4NUiLjPfyDvvayNMbYRrnqLMYjpD1cAgp"
    }
    ```
    ```json title="Result"
    {
      "ExistedAlready": false
    }
    ```
  </TabItem>
</Tabs>

:::note
Adding an already-existing relation doesn't result in an error: the return value `ExistedAlready` shows whether the relation is new or was already in place.
:::

## Revoke permissions {/* #revoke-permissions */}

You can revoke another actor's admin privileges with either the CLI command [`defradb client acp node relationship delete`](/references/cli/defradb_client_acp_node_relationship_add.md) or the HTTP endpoint [`/api/v1/acp/node/relationship`](/defradb/references/http/api/nac-relationship-delete/). Target actors are identified by their `DID` key.

<Tabs groupId="defra">
  <TabItem value="cli" label="CLI" default>
   ```shell title="Revoke the admin relation from an actor"
    defradb client acp node relationship delete \
	  --relation admin \
      --actor did:key:z7r8osuVyok8SVnHH5tsyNDRGyniu9pQoqBt7misXTEJAon5vYCt72NmFpya4NUiLjPfyDvvayNMbYRrnqLMYjpD1cAgp \
      --identity b17a7b973f629b900cf23654db9c4be935f90281707dd3e2cd7a56bdd2c1bf4f
    ```
    ```json title="Result"
    {
      "RecordFound": true
    }
    ```
  </TabItem>
  <TabItem value="http" label="HTTP API">
    ```http title="Revoke the admin relation from an actor"
    DELETE http://localhost:9181/api/v1/acp/node/relationship HTTP/2
    accept: application/json
    authorization: Bearer <jwtToken>
    content-type: application/json

    {
      "Relation": "admin",
      "TargetActor": "did:key:z7r8osuVyok8SVnHH5tsyNDRGyniu9pQoqBt7misXTEJAon5vYCt72NmFpya4NUiLjPfyDvvayNMbYRrnqLMYjpD1cAgp"
    }
    ```
    ```json title="Result"
    {
      "RecordFound": false
    }
    ```
  </TabItem>
</Tabs>

:::note
Deleting a non-existing relation doesn't result in an error: the return value `RecordFound` shows whether the relation existed or not prior to deletion.
:::

## Available permissions

The `admin` relation includes all the following permissions. It is not possible to grant an actor a subset of them.


<details>
  <summary>Permissions list</summary>
  
### Document Access Control

- bypass-dac
- enable-dac
- disable-dac
- purge-dac
- get-dac-status
- add-dac-relation
- delete-dac-relation
- add-dac-policy

### Node Access Control

- re-enable-nac
- disable-nac
- purge-nac
- get-nac-status
- add-nac-relation
- delete-nac-relation

### Collections

- patch-collection
- get-collection
- truncate-collection

### Documents

- read-document
- update-document
- delete-document

### Indexes

- list-index
- new-index
- delete-index
- new-encrypted-index
- delete-encrypted-index
- list-encrypted-index
- list-all-encrypted-index

### P2P

- connect-p2p-peer
- disconnect-p2p-peer
- get-p2p-peer-info
- get-p2p-active-peers
- add-p2p-replicator
- delete-p2p-replicator
- list-p2p-replicator
- add-p2p-collection
- delete-p2p-collection
- list-p2p-collection
- add-p2p-document
- delete-p2p-document
- list-p2p-document
- sync-p2p-documents
- sync-p2p-collection-versions
- sync-p2p-branchable-collection

### Blocks

- verify-signature

### Lenses & Migration

- add-lens
- list-lens
- set-migration

### Actions

- list-action

### Views

- refresh-view
- add-view

</details>