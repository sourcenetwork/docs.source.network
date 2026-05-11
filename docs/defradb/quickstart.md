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

<Tabs groupId="defra">
  <TabItem value="cli" label="CLI" default>
    The [`client` CLI commands](/references/cli/defradb_client.md) allow to interact with an instance from the command line.
  </TabItem>
  <TabItem value="http" label="HTTP API">
    The HTTP API is available at `http://localhost:9181/api/v1/`.  
    A versionless endpoint is also available at `http://localhost:9181/api/` and points always to the latest version.
  </TabItem>
  <TabItem value="graphql" label="GraphQL">
    The GraphQL endpoint is available at `http://localhost:9181/api/v1/graphql`.  
    A versionless endpoint is also available at  `http://localhost:9181/api/graphql` and points always to the latest version.
    
    GraphQL clients (ex. [Altair](https://altairgraphql.dev/)) are a popular option to interact with the GraphQL API.  
    The Playground at `http://localhost:9181` also provides a basic GraphQL client.
  </TabItem>
  <TabItem value="embedded" label="Embedded">
    You can import the [`defradb` Go package](https://pkg.go.dev/github.com/sourcenetwork/defradb) and interact with DefraDB directly via Go.  
    Technically, any language supporting C bindings will work.
  </TabItem>
</Tabs>


## Add a collection {/* #add-collection */}

Collections are the _types_ into which documents fit. Because every document belongs to a collection, you need to create collections before you can insert any data in the database.

You can create a collection with either the CLI command [`defradb client collection add`](/references/cli/defradb_client_collection_add.md), the HTTP API endpoint [`/collections`](/defradb/references/http/api/add-collection/), or the method `AddCollection`.

<Tabs groupId="defra">
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

[-> More information on collections](/schema/collections.md)

## Create documents {/* #create-documents */}

<Tabs groupId="defra">
  <TabItem value="cli" label="CLI" default>
    You can create new documents into `<collection>` via the mutation `add_<collection>` and the CLI command [`defradb client query`](/references/cli/defradb_client_query.md).

    ```shell title="Create a new document of type Book"
    defradb client query '
      mutation {
        b1:add_Book(input: {
          title: "1984",
          plot: "A masterpiece of rebellion and imprisonment where war is peace, freedom is slavery, and Big Brother is watching.",
          rating: 4.20
        }) {
          _docID
          title
        }
        b2:add_Book(input: {
          title: "Lord of the Flies",
          plot: "At the dawn of the next world war, a plane crashes on an uncharted island, stranding a group of schoolboys.",
          rating: 3.70
        }) {
          _docID
          title
        }
      }
    '
    ```
  </TabItem>
  <TabItem value="http" label="HTTP API">
    You can create new documents into `<collection>` via POST requests to the HTTP endpoint [`/api/v1/collections/<collection>`](/defradb/references/http/api/add-document/). The request body should contain the document information in JSON format.

    ```json title="Create two new documents of type Book"
    POST http://localhost:9181/api/v1/collections/Book

    [
      {
        "title": "1984",
        "plot": "A masterpiece of rebellion and imprisonment where war is peace, freedom is slavery, and Big Brother is watching.",
        "rating": 4.20
      },
      {
        "title": "Lord of the Flies",
        "plot": "At the dawn of the next world war, a plane crashes on an uncharted island, stranding a group of schoolboys.",
        "rating": 3.70
      }
    ]
    ```

    ```text title="Response"
    HTTP 200
    ```
  </TabItem>
  <TabItem value="graphql" label="GraphQL API">
    You can create new documents into `<collection>` via the mutation `add_<collection>`.

    ```graphql title="Create two new documents of type Book, returning their title and ID"
    mutation {
      b1:add_Book(input: {
        title: "1984",
        plot: "A masterpiece of rebellion and imprisonment where war is peace, freedom is slavery, and Big Brother is watching.",
        rating: 4.20
      }) {
        _docID
        title
      }
      b2:add_Book(input: {
        title: "Lord of the Flies",
        plot: "At the dawn of the next world war, a plane crashes on an uncharted island, stranding a group of schoolboys.",
        rating: 3.70
      }) {
        _docID
        title
      }
    }
    ```

    ```text title="Result"
    {
      "data": {
        "b1": [
          {
            "_docID": "bae-546ae840-77c7-51a5-ab0a-b5a893bfa546",
            "title": "1984"
          }
        ],
        "b2": [
          {
            "_docID": "bae-6c91c35c-e548-58f8-86a6-d60ab5174072",
            "title": "Lord of the Flies"
          }
        ]
      }
    }
    ```
  </TabItem>
  <TabItem value="embedded" label="Embedded">
    ```go title="Create a new document of type Book"
    createResult := db.DB.ExecRequest(
        ctx, `
        mutation {
          add_Book(input: {
            title: $title,
            plot: $plot,
            rating: $rating
          })
        }
        `,
        client.WithVariables(map[string]any{
            "title": "Infinite Jest",
            "plot": "A gargantuan, mind-altering tragi-comedy about the Pursuit of Happiness in America.",
            "rating": 4.25,
        }),
    )
    if len(createResult.GQL.Errors) > 0 {
        for _, gqlErr := range createResult.GQL.Errors {
            log.Printf("GraphQL error on create: %v\n", gqlErr)
        }
        log.Fatalf("Failed to create document in DefraDB.")
    }
  ```
  </TabItem>
</Tabs>

`_docID` is the document's unique identifier, determined by the collection it belongs to and the data it is initialized with.

[-> More information on creating documents](/dql/mutation-create.md)

## Query documents {/* #query-documents */}

Once you have populated your node with data, you can query it:

```shell
defradb client query '
  query {
    Book {
      _docID
      title
      plot
      rating
    }
  }
'
```

This query obtains *all* users and returns their fields `_docID, age, name, points`. GraphQL queries only return the exact fields requested (there is no equivalent of the SQL `SELECT *` syntax).

You can query for specific documents via the `filter` argument.
For example, to return only books with a `rating` *Greater Than or Equal to* (`_geq`) 3.5 and containing `Flies` in their title:


```shell
defradb client query '
  query {
    Book(filter: {rating: {_geq: 3.5}, title: {_like: "%Flies%"}) {
      _docID
      title
    }
  }
'
```

[-> More information on querying documents](/dql/mutation-query.md)

## Next steps {/* #next-steps */}

- [Set up data synchronization across nodes -> Peer-to-peer setup](/p2p/index.md)
- [Explore the graph of commits](/commits.md)
