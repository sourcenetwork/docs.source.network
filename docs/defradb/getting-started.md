---
sidebar_position: 1
title: Quickstart
slug: /
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# DefraDB Quickstart

DefraDB is a database that prioritizes data ownership, personal privacy, and local-first software. It feaures a multi-write-master architecture, a GraphQL-based query language ([DQL](/query-specification/query-language-overview.md)), and P2P syncronization across nodes.

For more background on the local-first paradigm, see [The Edge-First Awakening: Redefining the Foundations of Modern Computing](https://source.network/blog/the-edge-first-awakening-redefining-the-foundations-of-modern-computing).

## Install

Install `defradb` by [downloading the executable](https://github.com/sourcenetwork/defradb/releases) appropriate to your system.

Define a `secret` for DefraDB's keyring and start the local node:

```shell
DEFRA_KEYRING_SECRET=<secret> defradb start
```

To verify the local connection to the node, ping the `/health-check` HTTP endpoint:

```shell
wget -qO- http://localhost:9181/health-check
```

An online node responds with `"Healthy"`.

[-> More information on Installation](./install.md)

## Interact with the database

To experiment with queries, there are a few options:

- The playground at `http://localhost:9181`.
- GraphQL clients ([Altair](https://altairgraphql.dev/#download) is a popular option). DefraDB's GraphQL endpoint is at `http://localhost:9181/api/v1/graphql` (the versionless endpoint `http://localhost:9181/api/graphql` always points to the latest version).
- The [`client` CLI commands](/references/cli/defradb_client.md).
- Any language that supports C bindings.


## Add a collection

Collections are the _types_ into which documents fit.

The must be created with anything BUT the graphql endpoint.

To begin, add a collection:

<Tabs>
  <TabItem value="cli" label="CLI" default>
    ```shell
    defradb client collection add '
      type User {
        name: String
        age: Int
        verified: Boolean
        points: Float
      }
    '
    ```
  </TabItem>
  <TabItem value="http" label="HTTP API">
    ```request title="Request"
    POST http://localhost:9181/api/v1/collections

    type User {
      name: String
      age: Int
      verified: Boolean
      points: Float
    }
    ```
  </TabItem>
  <TabItem value="embedded" label="Embedded">
    ```go
    _, err = db.DB.AddSchema(ctx, `type User {
        name: String
        age: Int
        verified: Boolean
        points: Float
    }`)
    if err != nil {
        // Might fail for example if the schema is already added
        log.Fatalf("Failed to add schema: %v", err)
    }
  ```
  </TabItem>
</Tabs>


For more examples of collection definitions, see the [defradb -> examples/schema/](https://github.com/sourcenetwork/defradb/tree/develop/examples/collection) folder.

## Create documents

Submit a `mutation` request to create documents of the `User` type:

```shell
defradb client query '
  mutation {
      user1: add_User(input: {age: 31, verified: true, points: 90, name: "Bob"}) {
          _docID
      }
      user2: add_User(input: {age: 28, verified: false, points: 15, name: "Alice"}) {
          _docID
      }
      user3: add_User(input: {age: 35, verified: true, points: 100, name: "Charlie"}) {
          _docID
      }
  }
'
```

Expected response:

```json
{
  "data": {
    "user1": [
      {
        "_docID": "bae-fb9f4d0d-ccad-52d3-bd2e-6b0e5e4612e7"
      }
    ],
    "user2": [
      {
        "_docID": "bae-fdbdd3b5-31d4-51f9-afba-b9d5aacaf210"
      }
    ],
    "user3": [
      {
        "_docID": "bae-bf8fde7c-3344-5c48-818a-2747f0f76c07"
      }
    ]
  }
}
```

`_docID` is the document's unique identifier determined by the collection it belongs to and the data it is initialized with.

## Query documents

Once you have populated your node with data, you can query it:

```shell
defradb client query '
  query {
    User {
      _docID
      age
      name
      points
    }
  }
'
```

This query obtains *all* users and returns their fields `_docID, age, name, points`. GraphQL queries only return the exact fields requested (there is no equivalent of the SQL `SELECT *` syntax).

You can further filter results with the `filter` argument.

```shell
defradb client query '
  query {
    User(filter: {points: {_geq: 50}}) {
      _docID
      age
      name
      points
    }
  }
'
```

This returns only user documents which have a value for the `points` field *Greater Than or Equal to* (`_geq`) 50.

## Set up data synchronization across nodes
