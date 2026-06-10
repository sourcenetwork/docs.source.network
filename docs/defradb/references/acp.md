---
title: Document Access Control (DAC) policies
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## Authentication

`--identity` for cli, `Authorization: Bearer <JWTtoken>` for http

## Create a policy

```yml title="Example &ndash; policy.yml" test-filename="policy.yml"
name: A basic policy
description: Thou shall not pass
resources:
  - name: book
    relations:
      - name: reader
      - name: updater
      - name: deleter
    permissions:
      - name: read
        expr: reader
      - name: update
        expr: updater + deleter
      - name: delete
        expr: deleter
```

- `name` &ndash; Policy name.
- `description` (optional) &ndash; Policy description.
- `resources` &ndash; List of for permissions definitions.
  - `name` &ndash; Name for one ruleset.
  - `relations` &ndash; List of relationship types actors may be given to act on documents (similar to _roles_).
    - `name` &ndash; Name for relationship type.
  - `permissions` &ndash; List specifying which relationship type will get which permission.
    - `name` &ndash; Permission name (`read`, `update`, `delete`).
    - `expr` (optional) &ndash; Expression involving `relations` names. Actors who fulfill the expression get the permission. Supported operators are union `+` and subtraction `-`.

:::important Constraints for a policy to be valid
- The `permissions` list must include all of `read`, `update`, `delete`, even if `expr` is not specified. You can include more permissions: DefraDB will ignore them, but other applications may use them.
:::

:::note
- The document creator gets all permissions, even if you omit a permission expression. For example, this policy grants read permission to `reader` actors and write permissions only to the document creator:
  ```yml
  - name: read
    expr: reader
  - name: update
  - name: delete
  ```
- Relations allowed to update or delete automatically get permission to read. Subtract those relations if you don't want that:
  ```yml
  name: read
  expr: reader - updater - deleter
  ```
:::

## Generate an identity

Actors are identified via keys, of type either secp256k1 or ed25519. The CLI command [`defradb identity new`](/references/cli/defradb_identity_new.md) allows you to generate new identities. You will need the `PrivateKey` to identify yourself in all commands or queries involving documents under DAC.

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

## Register a policy

After you have crafted a policy and have the private key of the identity

<Tabs groupId="defra">
  <TabItem value="cli" label="CLI" default>
    via the CLI command [`defradb client acp document policy add`](/references/cli/defradb_client_acp_document_policy_add.md)

    ```shell
    defradb client acp document policy add -f policy.yml \
    --identity b17a7b973f629b900cf23654db9c4be935f90281707dd3e2cd7a56bdd2c1bf4f
    ```
    ```json
    {
      "PolicyID": "9528839e7dac8d2c236ced23d49dcfb1cc1ece86a1329c7c512755ba1f56ca37"
    }
    ```
  </TabItem>
  <TabItem value="http" label="HTTP API">
    submit a POST request to the HTTP endpoint [`/api/v1/acp/document/policy`](/defradb/references/http/api/add-dac-policy/). The request body should contain the documents information in JSON format.

    ```http 
    POST http://localhost:9181/api/v1/acp/document/policy HTTP/2
    accept: application/json
    content-type: application/json
    
    {
      "title": "Infinite Jest",
      "genre": "Fiction",
      "plot": "A gargantuan, mind-altering tragi-comedy about the Pursuit of Happiness in America.",
      "rating": 4.25
    }
    ```
  </TabItem>
</Tabs>

## Create a permissioned collection

For a policy to apply to some documents, the policy needs to be registered with the [collection](/schema/collections.md) holding such documents. Use the `@policy` directive to attach a policy to a collection, providing the policy ID and the name of the resource to attach. The result (and further calls to `defradb client collection describe`) shows the details under the `Policy` key.

```graphql
type Book @policy(
  id: "9528839e7dac8d2c236ced23d49dcfb1cc1ece86a1329c7c512755ba1f56ca37",
  resource: "book"
) {
  title: String
}
```
```json
[
  {
    "Name": "Book",
    "VersionID": "bafyreihfhq442e6dand4n35dkwmaiwsmoiqytp2prz7eqzrikpgupwpj5u",
    "CollectionID": "bafyreihfhq442e6dand4n35dkwmaiwsmoiqytp2prz7eqzrikpgupwpj5u",
    "CollectionSet": null,
    "Query": null,
    "PreviousVersion": null,
    "Fields": [
      {
        "FieldID": "bafyreihqzhiz3iwro4jozp6kphq4sosg6ccoqcbiaf7rg5dmvea7aux55a",
        "Name": "_docID",
        "Kind": 1,
        "Typ": 0,
        "RelationName": null,
        "IsPrimary": false,
        "DefaultValue": null,
        "Size": 0
      },
      {
        "FieldID": "bafyreihfb2izf5akjuua5jkijrgsgievsspboopupjq2its25owgle5pzm",
        "Name": "title",
        "Kind": 11,
        "Typ": 1,
        "RelationName": null,
        "IsPrimary": false,
        "DefaultValue": null,
        "Size": 0
      }
    ],
    "Indexes": [],
    "EncryptedIndexes": [],
    // highlight-start
    "Policy": {
      "ID": "9528839e7dac8d2c236ced23d49dcfb1cc1ece86a1329c7c512755ba1f56ca37",
      "ResourceName": "book"
    },
    // highlight-end
    "IsActive": true,
    "IsMaterialized": true,
    "IsBranchable": false,
    "IsEmbeddedOnly": false,
    "IsPlaceholder": false,
    "VectorEmbeddings": []
  }
]
```

## Create private and public documents

Permissioned collections can contain both private and public documents. Documents created without an identity are visible to all actors, whereas documents created with an identity are subject to the permission rules of the policy attached to the collection.

```shell title="Create a public document"
defradb client query '
mutation {
  add_Book(input: {
    title: "1984",
  }) {
    _docID
    title
  }
}
```
```shell title="Create a private document"
defradb client query --identity b17a7b973f629b900cf23654db9c4be935f90281707dd3e2cd7a56bdd2c1bf4f '
mutation {
  add_Book(input: {
    title: "Animal Farm",
  }) {
    _docID
    title
  }
}
```
```shell title="The public (or any un-authorized identity) doesn't see private documents"
defradb client query '
{
  Book {
    _docID
    title
  }
}
'
```
```json title="Result"
{
  "data": {
    "Book": [
      {
        "_docID": "bae-72bb6e1c-479f-584c-8f63-2756c3bd63ca",
        "title": "1984"
      }
    ]
  }
}
```

## Share a document with other actors

To give another actor permission to access or alter a document, you need to create a relation between the actor and a document ID. The relation defines what type of permissions (according to the collection's policy) the actor will get. The actor is identified by the `DID` key. Adding an already-existing relation doesn't result in an error: the return value `ExistedAlready` shows whether the relation is new or was already in place.

<Tabs groupId="defra">
  <TabItem value="cli" label="CLI" default>
    via the CLI command [`defradb client acp document relationship add`](/references/cli/defradb_client_acp_document_relationship_add.md)

   ```shell
    defradb client acp document relationship add \
      --collection Book \
      --docID bae-72bb6e1c-479f-584c-8f63-2756c3bd63ca \
      --relation reader \
      --actor did:key:z7r8osuVyok8SVnHH5tsyNDRGyniu9pQoqBt7misXTEJAon5vYCt72NmFpya4NUiLjPfyDvvayNMbYRrnqLMYjpD1cAgp \
      --identity b17a7b973f629b900cf23654db9c4be935f90281707dd3e2cd7a56bdd2c1bf4f
    ```
    ```json
    {
      "ExistedAlready": false
    }
    ```
  </TabItem>
  <TabItem value="http" label="HTTP API">
    submit a POST request to the HTTP endpoint [`/api/v1/acp/document/relationship`](/defradb/references/http/api/add-dac-relationship/). The request body should contain the documents information in JSON format.

    ```http 
    POST http://localhost:9181/api/v1/acp/document/relationship HTTP/2
    accept: application/json
    content-type: application/json

    {
      "CollectionName": "string",
      "DocID": "string",
      "Relation": "string",
      "TargetActor": "string"
    }
    ```
  </TabItem>
</Tabs>
