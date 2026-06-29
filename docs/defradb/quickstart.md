---
title: Quickstart
slug: /
description: DefraDB is the database for local-first applications centered around data privacy, time-traveling queries, multi-write architecture, and P2P synchronization.
---

DefraDB is the database for local-first applications that prioritizes data ownership, personal privacy, and P2P synchronization. It features data encryption and verification, the ability to travel in time through the history of documents, and a multi-write-master architecture. The [DefraDB Query Language (DQL)](/dql/index.md) is based on GraphQL.

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
    The versionless endpoint at `http://localhost:9181/api/` points to the latest version.
  </TabItem>
  <TabItem value="graphql" label="GraphQL">
    GraphQL clients (ex. [Altair](https://altairgraphql.dev/)) are a popular option to interact with the GraphQL API.  
    The GraphQL endpoint is available at `http://localhost:9181/api/v1/graphql`.  
    The versionless endpoint at `http://localhost:9181/api/graphql` points to the latest version.
  </TabItem>
  <TabItem value="explorer" label="Explorer">
    The DefraDB Explorer is a web application available at `http://localhost:9181`, and also hosted at https://explorer.source.network/. It provides a GraphQL client and an interface to the most common instance management operations.
  </TabItem>
</Tabs>


## Add collections {/* #add-collections */}

Collections are the _types_ into which documents fit: they describe the database schema. You need to create collections before you can insert any data. A collection has a name and a number of typed fields.

<Tabs groupId="defra">
  <TabItem value="cli" label="CLI" default>
    ```shell title='Create a collection named "Book"'
    defradb client collection add '
      type Book {
        title: String!
        plot: String
        rating: Float
      }
    '
    ```
  </TabItem>
  <TabItem value="http" label="HTTP API">
    ```http title='Create a collection named "Book"'
    POST http://localhost:9181/api/v1/collections HTTP/2
    accept: application/json
    content-type: text/plain

    type Book {
      title: String!
      plot: String
      rating: Float
    }
    ```
  </TabItem>
</Tabs>

[-> More information on collections](/schema/collections.md)

## Create documents {/* #create-documents */}

DefraDB stores data in _documents_. You can think that a document is of a specific _type_, or that it belongs to a specific _collection_: they are two sides of the same coin.

<Tabs groupId="defra">
  <TabItem value="cli" label="CLI" default>
    Create documents of a given `<type>` with the function `add_<type>`. For example, use `add_Book` to create documents in the `Book` collection.

    ```shell title='Create two new documents of type "Book", returning their title and unique ID'
    defradb client query '
      mutation {
        b1:add_Book(input: {
          title: "1984",
          plot: "A masterpiece of rebellion and imprisonment where war is peace, freedom is slavery, and Big Brother is watching.",
          rating: 4.20
        }) {
          title
          plot
        }
        b2:add_Book(input: {
          title: "Lord of the Flies",
          plot: "At the dawn of the next world war, a plane crashes on an uncharted island, stranding a group of schoolboys.",
          rating: 3.70
        }) {
          title
          plot
        }
      }
    '
    ```
    ```json title="Result"
    {
      "data": {
        "b1": [
          {
            "plot": "A masterpiece of rebellion and imprisonment where war is peace, freedom is slavery, and Big Brother is watching.",
            "title": "1984"
          }
        ],
        "b2": [
          {
            "plot": "At the dawn of the next world war, a plane crashes on an uncharted island, stranding a group of schoolboys.",
            "title": "Lord of the Flies"
          }
        ]
      }
    }
    ```
  </TabItem>
  <TabItem value="http" label="HTTP API">
    Create documents of a given `<type>` via the HTTP endpoint [`/api/v1/collections/<type>`](/defradb/references/http/api/add-document/). For example, use `/api/v1/collections/Book` to create documents in the `Book` collection.

    ```http title='Create two new documents of type "Book"'
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
    Create documents of a given `<type>` with the function `add_<type>`. For example, use `add_Book` to create documents in the `Book` collection.

    ```graphql title='Create two new documents of type "Book", returning their title and plot'
    mutation {
      b1:add_Book(input: {
        title: "1984",
        plot: "A masterpiece of rebellion and imprisonment where war is peace, freedom is slavery, and Big Brother is watching.",
        rating: 4.20
      }) {
        title
        plot
      }
      b2:add_Book(input: {
        title: "Lord of the Flies",
        plot: "At the dawn of the next world war, a plane crashes on an uncharted island, stranding a group of schoolboys.",
        rating: 3.70
      }) {
        title
        plot
      }
    }
    ```
    ```json title="Result"
    {
      "data": {
        "b1": [
          {
            "plot": "A masterpiece of rebellion and imprisonment where war is peace, freedom is slavery, and Big Brother is watching.",
            "title": "1984"
          }
        ],
        "b2": [
          {
            "plot": "At the dawn of the next world war, a plane crashes on an uncharted island, stranding a group of schoolboys.",
            "title": "Lord of the Flies"
          }
        ]
      }
    }
    ```
  </TabItem>
</Tabs>

[-> More information on creating documents](/dql/mutation-create.md)

## Query documents {/* #query-documents */}

The basic skeleton of a query is made of the collection you want to fetch from (ex. `Book`) and the fields you want to return (ex. `title`, `plot`).

<Tabs groupId="defra">
  <TabItem value="cli" label="CLI" default>
    ```shell title="Retrieve all documents of type Book, returning title and plot"
    defradb client query '
    {
      Book {
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
            "plot": "A masterpiece of rebellion and imprisonment where war is peace, freedom is slavery, and Big Brother is watching.",
            "title": "1984"
          },
          {
            "plot": "At the dawn of the next world war, a plane crashes on an uncharted island, stranding a group of schoolboys.",
            "title": "Lord of the Flies"
          }
        ]
      }
    }
    ```
  </TabItem>
  <TabItem value="http" label="HTTP API">
    ```http title="Retrieve all documents of type Book, returning title and plot"
    POST http://localhost:9181/api/v1/graphql HTTP/2
    accept: application/json
    content-type: application/json
    
    {
      "query": "{ Book { title plot } }"
    }
    ```
    ```json title="Result"
    {
      "data": {
        "Book": [
          {
            "plot": "A masterpiece of rebellion and imprisonment where war is peace, freedom is slavery, and Big Brother is watching.",
            "title": "1984"
          },
          {
            "plot": "At the dawn of the next world war, a plane crashes on an uncharted island, stranding a group of schoolboys.",
            "title": "Lord of the Flies"
          }
        ]
      }
    }
    ```
  </TabItem>
  <TabItem value="graphql" label="GraphQL API">
    ```graphql title="Retrieve all documents of type Book, returning title and plot"
    {
      Book {
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
            "plot": "A masterpiece of rebellion and imprisonment where war is peace, freedom is slavery, and Big Brother is watching.",
            "title": "1984"
          },
          {
            "plot": "At the dawn of the next world war, a plane crashes on an uncharted island, stranding a group of schoolboys.",
            "title": "Lord of the Flies"
          }
        ]
      }
    }
    ```
  </TabItem>
</Tabs>

The DefraDB Query Language (DQL) is a rich GraphQL-based language supporting relationships between documents, filtering, limiting, sorting, and grouping.

```graphql title="Example query – Filter books by genre and author's name; return 3 ordered by title"
{
  Book(
    filter: {
      genre: { _eq: "Fiction" },
      author: { name: { _eq: "George Orwell" } }
    },
    limit: 3,
    order: { "title": ASC }
  ) {
    title
    plot
    author {
      name
    }
  }
}
```

[-> More information on querying documents](/dql/mutation-query.md)

## Next steps {/* #next-steps */}

- [Learn how to use the DefraDB Query Language](/dql/index.md)
- [Set up data synchronization across nodes](/p2p/index.md)
- [Restrict documents access](/security/document-access-control.md)
