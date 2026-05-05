---
title: Quickstart
slug: /
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

DefraDB is a database that prioritizes data ownership, personal privacy, and local-first software. It feaures a multi-write-master architecture, a GraphQL-based query language ([DQL](/query-specification/query-language-overview.md)), and P2P syncronization across nodes.

For more background on the local-first paradigm, see [The Edge-First Awakening: Redefining the Foundations of Modern Computing](https://source.network/blog/the-edge-first-awakening-redefining-the-foundations-of-modern-computing).

## Install {/* #install */}

Get `defradb` by [downloading the executable](https://github.com/sourcenetwork/defradb/releases) appropriate to your system.

Define a `secret` for DefraDB's keyring and start the local node:

```shell
DEFRA_KEYRING_SECRET=<secret> defradb start
```

To verify the local connection to the node, ping the `/health-check` HTTP endpoint:

```shell
wget -qO- http://localhost:9181/health-check
```

An online node responds with `"Healthy"`.

[-> More information and install options](/install/index.md)

## Interact with the database {/* #interact-with-the-database */}

You can interact with DefraBD in a few different ways. Most actions can be run with all tools, but some are not available on all options.

<Tabs>
  <TabItem value="cli" label="CLI" default>
    The [`client` CLI commands](/references/cli/defradb_client.md).
  </TabItem>
  <TabItem value="http" label="HTTP API">
    Listens on `http://localhost:9181/api/v1`
  </TabItem>
  <TabItem value="graphql" label="GraphQL">
    GraphQL clients ([Altair](https://altairgraphql.dev/#download) is a popular option). DefraDB's GraphQL endpoint is at `http://localhost:9181/api/v1/graphql` (the versionless endpoint `http://localhost:9181/api/graphql` always points to the latest version).
    
    The Playground at `http://localhost:9181` provides a basic GraphQL client.
  </TabItem>
  <TabItem value="embedded" label="Embedded">
    https://pkg.go.dev/github.com/sourcenetwork/defradb
    Any language that supports C bindings.
  </TabItem>
</Tabs>


## Add a collection {/* #add-collection */}

Collections are the _types_ into which documents fit. Because every document belongs to a collection, you need to create collections before you can insert any data in the database.

<Tabs>
  <TabItem value="cli" label="CLI" default>
    ```shell
    defradb client collection add '
      type Book {
        title: String
        plot: String
        rating: Float
      }
    '
    ```
  </TabItem>
  <TabItem value="http" label="HTTP API">
    ```request title="Request"
    POST http://localhost:9181/api/v1/collections

    type Book {
      title: String
      plot: String
      rating: Float
    }
    ```
  </TabItem>
  <TabItem value="embedded" label="Embedded">
    ```go
    _, err = db.DB.AddCollection(ctx, `type Book {
        title: String
        plot: String
        rating: Float}
    }`)
    if err != nil {
        // Fails for example if the collection is already added
        log.Fatalf("Failed to add collection: %v", err)
    }
  ```
  </TabItem>
</Tabs>

[-> More information on collections](/collections/create.md)

## Create documents {/* #create-documents */}

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

## Query documents {/* #query-documents */}

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

## Set up data synchronization across nodes {/* #set-up-p2p */}
