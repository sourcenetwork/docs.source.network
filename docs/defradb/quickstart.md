---
title: Quickstart
slug: /
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

DefraDB is the database for local-first applications that prioritizes data ownership, personal privacy, and P2P synchronization. It features data encryption and verification, the ability to travel in time through the history of documents, and a multi-write-master architecture. The [DefraDB Query Language (DQL)](/query-specification/query-language-overview.md) is based on GraphQL.

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

## Interact with the database {/* #interact */}

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


## Add collections {/* #add-collections */}

Collections are the _types_ into which documents fit, like tables in SQL. Because every document belongs to a collection, you need to create collections before you can insert any data. A collection has a name (ex. `Book`) and a number of typed fields (ex. `title: String`).

<Tabs groupId="defra">
  <TabItem value="cli" label="CLI" default>
    You can create a collection with the CLI command [`defradb client collection add`](/references/cli/defradb_client_collection_add.md).

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
    You can create a collection via the HTTP API endpoint [`/collections`](/defradb/references/http/api/add-collection/).

    ```http title="Request"
    POST http://localhost:9181/api/v1/collections HTTP/2
    accept: application/json
    content-type: text/plain

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
    To create documents of type `<type>`, use the mutation `add_<type>` via the CLI command [`defradb client query`](/references/cli/defradb_client_query.md). For example, to create a document in the `Book` collection, use `add_Book`.

    Every `add_<type>` mutation must return some of the inserted information. Because GraphQL queries only return the exact fields requested, you have to provide a list of return fields (there is no equivalent of the SQL `SELECT *` syntax).

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
    ```json title="Result"
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
  <TabItem value="http" label="HTTP API">
    To create documents of type `<type>`, submit a POST request to the HTTP endpoint [`/api/v1/collections/<collection>`](/defradb/references/http/api/add-document/). For example, submit a request to `/api/v1/collections/Book`. The request body should contain the documents information in JSON format.

    ```http title="Create two new documents of type Book"
    POST http://localhost:9181/api/v1/collections/Book HTTP/2
    accept: application/json
    content-type: application/json

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
  </TabItem>
  <TabItem value="graphql" label="GraphQL API">
    To create documents of type `<type>`, use the mutation `add_<type>`. For example, to create a document in the `Book` collection, use `add_Book`.

    Every `add_<type>` mutation must return some of the inserted information. Because GraphQL queries only return the exact fields requested, you have to provide a list of return fields (there is no equivalent of the SQL `SELECT *` syntax).

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
    ```json title="Result"
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

The basic skeleton of a query is made of the collection you want to fetch from (ex. `Book`) and the fields you want to return (ex. `_docID`, `title`, `plot`).

<Tabs groupId="defra">
  <TabItem value="cli" label="CLI" default>
    You can run a query via the CLI command [`defradb client query`](/references/cli/defradb_client_query.md).

    ```shell title="Retrieve all documents of type Book, returning docID, title, plot"
    defradb client query '
    {
      Book {
        _docID
        title
        plot
      }
    }
    '
    ```
    ```json title="Result"
    {
      "data": {
        "Book": [
          {
            "_docID": "bae-526a42c6-c147-57e4-89e0-875d27a1532d",
            "plot": "A masterpiece of rebellion and imprisonment where war is peace, freedom is slavery, and Big Brother is watching.",
            "title": "1984"
          },
          {
            "_docID": "bae-9579541e-f15d-506e-a74a-63d00cb3ab56",
            "plot": "At the dawn of the next world war, a plane crashes on an uncharted island, stranding a group of schoolboys.",
            "title": "Lord of the Flies"
          }
        ]
      }
    }
    ```
  </TabItem>
  <TabItem value="http" label="HTTP API">
    You can run a query by submitting a `POST` request to the HTTP endpoint [`/api/v1/graphql`](/references/http/api/post-graphql/). The body must be a JSON object, with the GraphQL query under the `query` key. Newlines are not supported within the `query` string field.

    ```http title="Retrieve all documents of type Book, returning docID, title, plot"
    POST http://localhost:9181/api/v1/graphql HTTP/2
    accept: application/json
    content-type: application/json
    
    {
      "query": "{ Book { _docID title plot } }"
    }
    ```
    ```json title="Result"
    {
      "data": {
        "Book": [
          {
            "_docID": "bae-526a42c6-c147-57e4-89e0-875d27a1532d",
            "plot": "A masterpiece of rebellion and imprisonment where war is peace, freedom is slavery, and Big Brother is watching.",
            "title": "1984"
          },
          {
            "_docID": "bae-9579541e-f15d-506e-a74a-63d00cb3ab56",
            "plot": "At the dawn of the next world war, a plane crashes on an uncharted island, stranding a group of schoolboys.",
            "title": "Lord of the Flies"
          }
        ]
      }
    }
    ```
  </TabItem>
  <TabItem value="graphql" label="GraphQL API">
    ```graphql title="Retrieve all documents of type Book, returning docID, title, plot"
    {
      Book {
        _docID
        title
        plot
      }
    }
    ```
    ```json title="Result"
    {
      "data": {
        "Book": [
          {
            "_docID": "bae-526a42c6-c147-57e4-89e0-875d27a1532d",
            "plot": "A masterpiece of rebellion and imprisonment where war is peace, freedom is slavery, and Big Brother is watching.",
            "title": "1984"
          },
          {
            "_docID": "bae-9579541e-f15d-506e-a74a-63d00cb3ab56",
            "plot": "At the dawn of the next world war, a plane crashes on an uncharted island, stranding a group of schoolboys.",
            "title": "Lord of the Flies"
          }
        ]
      }
    }
    ```
  </TabItem>
</Tabs>

[-> More information on querying documents](/dql/mutation-query.md)

{/* 
## Next steps  #next-steps 

- [Set up data synchronization across nodes -> Peer-to-peer setup](/p2p/index.md)
- [Explore the graph of commits](/commits.md)
*/}
