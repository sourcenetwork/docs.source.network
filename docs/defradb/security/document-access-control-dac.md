---
title: Document Access Control (DAC) policies
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

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

## Create policies {/* #create-policy */}

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
- `resources` &ndash; List of permissions definitions.
  - `name` &ndash; Name of the permission object.
  - `relations` &ndash; List of relationship types actors may be given to act on documents (similar to _user roles_).
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

### The _policy administrator_ relation  {/* #admin-privileges */}

The creator of a policy always retains administration privileges onto the policy: they can grant permissions to other people, as well as delete the policy entirely.
The relation type `manages` grants administration privileges to other actors. Actors with the `manages` relation will be able to grant permissions to others and alter the policy in the same way as the owner can.

```yml
relations:
  - name: reader
  - name: admin
    manages:
      - reader
```

## Register policies {/* #register-policy */}

After you have crafted a policy, you need to add it into DefraDB. To register a policy you must provide the `PrivateKey` of an actor's identity. The actor registering the policy is stored as, _surprise_, policy creator (owner) and has administration rights on it. The returned `PolicyID` allows you to attach the policy to a collection.

<Tabs groupId="defra">
  <TabItem value="cli" label="CLI" default>
    Register a policy via the CLI command [`defradb client acp document policy add`](/references/cli/defradb_client_acp_document_policy_add.md). The example sources the policy from file, but you can source a policy from argument string and stdin as well.

    ```shell
    defradb client acp document policy add -f policy.yml \
    --identity b17a7b973f629b900cf23654db9c4be935f90281707dd3e2cd7a56bdd2c1bf4f
    ```
    ```json title="Result"
    {
      "PolicyID": "9528839e7dac8d2c236ced23d49dcfb1cc1ece86a1329c7c512755ba1f56ca37"
    }
    ```
  </TabItem>
  <TabItem value="http" label="HTTP API">
    Register a policy by submitting a POST request to the HTTP endpoint [`/api/v1/acp/document/policy`](/defradb/references/http/api/add-dac-policy/). The request body should contain the policy content in YAML format.

    ```http 
    POST http://localhost:9181/api/v1/acp/document/policy HTTP/2
    accept: application/json
    authorization: Bearer <jwtToken>
    content-type: text/plain
    
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
    ```json title="Result"
    {
      "PolicyID": "9528839e7dac8d2c236ced23d49dcfb1cc1ece86a1329c7c512755ba1f56ca37"
    }
    ```
  </TabItem>
</Tabs>

## Create permissioned collections {/* #permissioned-collections */}

For a policy to apply to some documents, the policy needs to be registered with the [collection](/schema/collections.md) holding such documents. Use the `@policy` directive to attach a policy to a collection, providing the policy ID and the name of the resource to attach. The result (and further calls to `defradb client collection describe`) shows the details under the `Policy` key.

```graphql
# highlight-start
type Book @policy(
  id: "9528839e7dac8d2c236ced23d49dcfb1cc1ece86a1329c7c512755ba1f56ca37",
  resource: "book"
) {
# highlight-end
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

## Private and public documents {/* #public-private-docs */}

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
```shell title="The public (or any unauthorized identity) can't see private documents"
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

## Grant permissions to other actors {/* #grant-permissions */}

To give another actor permission to access or alter a document, create a *relation* between the actor and the document ID. The relation defines what type of permission (according to the collection's policy) the actor will get. You can think that the relation assigns the identity a _role_ (ex. `reader`) with respect to a specific document. Target actors are identified by their `DID` key.

The only actors allowed to grant permissions to others are the policy creator and the identities having the [administration relation](#admin-privileges).

:::important
You can only create ACP relationships to private documents (i.e. documents created with an identity). Public documents are not registered in the ACP system and cannot be permissioned.
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
    Give an actor permissions to a given document by submitting a POST request to the HTTP endpoint [`/api/v1/acp/document/relationship`](/defradb/references/http/api/add-dac-relationship/).

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

### Grant permissions to everybody {/* #wildcard-relations */}

To grant a specific permission to any actor, use the wildcard `"*"` as value for the actor's identity.

<Tabs groupId="defra">
  <TabItem value="cli" label="CLI" default>
   ```shell
    defradb client acp document relationship add \
      --collection Book \
      --docID bae-04ba3b88-1ac9-54f0-89b5-6abedff7201f \
      --relation reader \
      # highlight-next-line
      --actor "*" \
      --identity b17a7b973f629b900cf23654db9c4be935f90281707dd3e2cd7a56bdd2c1bf4f
    ```
  </TabItem>
  <TabItem value="http" label="HTTP API">
    ```http
    POST http://localhost:9181/api/v1/acp/document/relationship HTTP/2
    accept: application/json
    authorization: Bearer <jwtToken>
    content-type: application/json

    {
      "CollectionName": "Book",
      "DocID": "bae-04ba3b88-1ac9-54f0-89b5-6abedff7201f",
      "Relation": "reader",
      // highlight-next-line
      "TargetActor": "*"
    }
    ```
  </TabItem>
</Tabs>

## Revoke permissions {/* #revoke */}

To revoke an actor's document permissions, delete their relationship with the given document ID. Revoking [relations granted to any actor with `"*"`](#wildcard-relations) only revokes that individual relation: it doesn't revoke _all_ relations registered for _any_ actor.

The only actors allowed to revoke permissions are the policy creator and the identities having the [administration relation](#admin-privileges).

<Tabs groupId="defra">
  <TabItem value="cli" label="CLI" default>
    Revoke an actor's permissions to a given document via the CLI command [`defradb client acp document relationship delete`](/references/cli/defradb_client_acp_document_relationship_delete.md)

   ```shell
    defradb client acp document relationship delete \
      --collection Book \
      --docID bae-04ba3b88-1ac9-54f0-89b5-6abedff7201f \
      --relation reader \
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
    To revoke an actor's permissions to a given document, submit a DELETE request to the HTTP endpoint [`/api/v1/acp/document/relationship`](/defradb/references/http/api/add-dac-relationship/).

    ```http
    DELETE http://localhost:9181/api/v1/acp/document/relationship HTTP/2
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
      "RecordFound": true
    }
    ```
  </TabItem>
</Tabs>

:::note
Deleting a non-existing relation doesn't result in an error: the return value `RecordFound` shows whether the relation existed or not prior to deletion.
:::
