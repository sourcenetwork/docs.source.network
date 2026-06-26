---
title: Restrict node management operations
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

Node operations are managed by Node Access Control (NAC).
lala

## Enable NAC

Node Access Control is disabled by default. To enable it, start the instance with the `--node-acp-enable` flag and provide an [identity's private key](identity.md) to the `--identity` flag. The given identity will be registered as the instance administrator.

```shell title="Start DefraDB with Node Access Control enabled"
defradb start --node-acp-enable --identity b17a7b973f629b900cf23654db9c4be935f90281707dd3e2cd7a56bdd2c1bf4f
```

After the first time NAC is enabled, further attempts to enable it on startup (possibly with a different identity) are ignored.



## Re-enable NAC

If NAC gets [disabled](#disable-nac) after it had been enabled, you can re-enable it with either the CLI command [`defradb client acp node re-enable`](/references/cli/defradb_client_acp_node_re-enable.md) or the HTTP endpoint [`/acp/node/re-enable`](/defradb/references/http/api/re-enable-nac/). An actor must have the `re-enable-nac` permission to re-enable NAC.

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

## Disable NAC

You can temporarily disable NAC with either the CLI command [`defradb client acp node disable`](/references/cli/defradb_client_acp_node_disable.md) or the HTTP endpoint [`/acp/node/disable`](/defradb/references/http/api/disable-nac/). All NAC checks are suspended while NAC is disabled, so any actor will be able to perform any operation.

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

## Show NAC status

You can show the current NAC status with either the CLI command [`defradb client acp node status`](/references/cli/defradb_client_acp_node_status.md) or the HTTP endpoint [`/acp/node/status`](/defradb/references/http/api/check-status-of-nac/).

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

## Grant permissions


To give another actor permission to access or alter a document, create a *relation* between the actor and the document ID. The relation defines what type of permission (according to the collection's policy) the actor will get. You can think that the relation assigns the identity a _role_ (ex. `reader`) with respect to a specific document. Target actors are identified by their `DID` key.

The only actors allowed to grant permissions to others are the policy creator and the identities with the appropriate [manage relation](#manage-relation). The request to create a relation must be [authenticated](authentication.md).

:::important
You can only create relations to private documents (i.e. documents created with an identity). Public documents are not registered in the DAC system and cannot be permissioned.
:::

<Tabs groupId="defra">
  <TabItem value="cli" label="CLI" default>
    Give an actor permissions to a given document via the CLI command [`defradb client acp document relationship add`](/references/cli/defradb_client_acp_document_relationship_add.md)

   ```shell
    defradb client acp document relationship add \
      --collection Book \
      --docID bae-04ba3b88-1ac9-54f0-89b5-6abedff7201f \
      --relation reader \
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
    Give an actor permissions to a given document by submitting a `POST` request to the HTTP endpoint [`/api/v1/acp/document/relationship`](/defradb/references/http/api/add-dac-relationship/).

    ```http
    POST http://localhost:9181/api/v1/acp/document/relationship HTTP/2
    accept: application/json
    authorization: Bearer <jwtToken>
    content-type: application/json

    {
      "CollectionName": "Book",
      "DocID": "bae-04ba3b88-1ac9-54f0-89b5-6abedff7201f",
      "Relation": "reader",
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

### Available permissions

- bypass-dac
- enable-dac
- disable-dac
- purge-dac
- get-dac-status
- add-dac-relation
- delete-dac-relation
- add-dac-policy

- re-enable-nac
- disable-nac
- purge-nac
- get-nac-status
- add-nac-relation
- delete-nac-relation

- patch-collection
- get-collection
- truncate-collection

- read-document
- update-document
- delete-document

- list-index
- new-index
- delete-index

- new-encrypted-index
- delete-encrypted-index
- list-encrypted-index
- list-all-encrypted-index

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

- verify-signature

- add-lens
- list-lens

- list-action

- refresh-view
- add-view

- set-migration

