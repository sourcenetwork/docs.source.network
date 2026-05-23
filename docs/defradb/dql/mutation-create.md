---
title: Create new documents
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

Once you have [created collections](/schema/collections.md), you can start adding documents into them. 

<details>
  <summary>Display database setup</summary>
  
  This page assumes your database contains `Book` and `Person` [collections](/schema/collections.md):

  ```graphql title="Database schema" test-setup-collection
  type Person {
    name: String
    authoredBooks: [Book]
  }

  type Book {
    title: String
    genre: String
    plot: String
    rating: Float
    author: Person
  }
  ```
</details>

## Create one new document {/* #single */}

<Tabs groupId="defra">
  <TabItem value="cli" label="CLI" default>
    To create documents of type `<type>`, use the mutation `add_<type>`. For example, to create a document in the `Book` collection, use `add_Book`.

    Every `add_<type>` mutation must return some of the inserted information. Because GraphQL queries only return the exact fields requested, you have to provide a list of fields to be returned (there is no equivalent of the SQL `SELECT *` syntax).

    ```shell title="Create a new document of type Book"
    defradb client query '
      mutation {
        add_Book(input: {
          title: "Infinite Jest",
          genre: "Fiction",
          plot: "A gargantuan, mind-altering tragi-comedy about the Pursuit of Happiness in America.",
          rating: 4.25
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
        "add_Book": [
          {
            "_docID": "bae-ad13cbb3-0970-5e1d-8096-620f7bd27d26",
            "title": "Infinite Jest"
          }
        ]
      }
    }
    ```
  </TabItem>
  <TabItem value="http" label="HTTP API">
    To create documents of type `<type>`, submit a POST request to the HTTP endpoint [`/api/v1/collections/<collection>`](/defradb/references/http/api/add-document/). For example, submit a request to `/api/v1/collections/Book`. The request body should contain the documents information in JSON format.

    ```http title="Create a new document of type Book"
    POST http://localhost:9181/api/v1/collections/Book HTTP/2
    accept: application/json
    content-type: application/json
    
    {
      "title": "Infinite Jest",
      "genre": "Fiction",
      "plot": "A gargantuan, mind-altering tragi-comedy about the Pursuit of Happiness in America.",
      "rating": 4.25
    }
    ```

    :::note
    The HTTP API doesn't support creating and *returning* documents in the same request. You need to [query for documents](mutation-query.md) separately.
    :::
  </TabItem>
  <TabItem value="graphql" label="GraphQL API">
    To create documents of type `<type>`, use the mutation `add_<type>`. For example, to create a document in the `Book` collection, use `add_Book`.

    Every `add_<type>` mutation must return some of the inserted information. Because GraphQL queries only return the exact fields requested, you have to provide a list of fields to be returned (there is no equivalent of the SQL `SELECT *` syntax).
    
    ```graphql title="Create a new document of type Book"
    mutation {
      add_Book(input: {
        title: "Infinite Jest",
        genre: "Fiction",
        plot: "A gargantuan, mind-altering tragi-comedy about the Pursuit of Happiness in America.",
        rating: 4.25
      }) {
        _docID
        title
      }
    }
    ```

    ```json title="Result"
    {
      "data": {
        "add_Book": [
          {
            "_docID": "bae-ad13cbb3-0970-5e1d-8096-620f7bd27d26",
            "title": "Infinite Jest"
          }
        ]
      }
    }
    ```
  </TabItem>
</Tabs>

## The document ID

The field `_docID` is the document's unique identifier, determined by the collection it belongs to and the data it is initialized with. The data in the document might change over time, but its docID will stay the same. 

:::tip
The `_docID` field is the only one to be [automatically indexed](/schema/indexes.md).
:::

## Create documents with relationships {/* #relationships */}

To add documents with relationships to each other, you need two queries: one to create the documents, and another to link them together via their docIDs.

For example, to create a book and link it to an author, first create the documents and return their docIDs:

```graphql title="Create new documents for Person and Book"
mutation {
  p:add_Person(input: {
    name: "Victor Hugo"
  }) {
    _docID
    name
  }
  b:add_Book(input: {
    title: "Les Misérables",
    genre: "Fiction",
    plot: "Victor Hugo's tale of injustice, heroism and love follows the fortunes of Jean Valjean, an escaped convict determined to put his criminal past behind him.",
    rating: 4.21
  }) {
    _docID
    title
  }
}
```
```json title="Result"
{
  "data": {
    "b": [
      {
        "_docID": "bae-e1dcefa0-46ca-5ae5-bc0a-859f2e7e1259",
        "title": "Les Misérables"
      }
    ],
    "p": [
      {
        "_docID": "bae-c169e917-df52-5603-9224-39c1757f1b04",
        "name": "Victor Hugo"
      }
    ]
  }
}
```

To link them, use an [update mutation](/dql/mutation-update.md) to set the field `_authorID` on `Book` with the docID from the desired `Person`:

```graphql title="Link book and author via Book._authorID"
mutation {
  update_Book(
    docID: "bae-e1dcefa0-46ca-5ae5-bc0a-859f2e7e1259",
    input: {  # properties to be altered
      _authorID: "bae-c169e917-df52-5603-9224-39c1757f1b04"
    }
  ) {
    _docID
    _authorID
    title
  }
}
```
```json title="Result"
{
  "data": {
    "update_Book": [
      {
        "_authorID": "bae-c169e917-df52-5603-9224-39c1757f1b04",
        "_docID": "bae-e1dcefa0-46ca-5ae5-bc0a-859f2e7e1259",
        "title": "Les Misérables"
      }
    ]
  }
}
```

## Create multiple documents at once {/* #multiple */}

You can create multiple documents in the same request by concatenating several `add_<collection>` statements.

<Tabs groupId="defra">
  <TabItem value="cli" label="CLI" default>
    To avoid clashes, you need to [alias](aliases.md) the results (`b1` and `b2` in the example). The aliases are used as keys in the result json.

    ```shell title="Create two documents"
    defradb client query '
      mutation {
      # highlight-next-line
      b1:add_Book(input: {
        title: "1984",
        genre: "Fiction",
        plot: "A masterpiece of rebellion and imprisonment where war is peace, freedom is slavery, and Big Brother is watching.",
        rating: 4.20
      }) {
        _docID
        title
      }
      # highlight-next-line
      b2:add_Book(input: {
        title: "Lord of the Flies",
        genre: "Fiction",
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
            "_docID": "bae-87c50a88-e1de-5df9-9659-cfe52d10dc7a",
            "title": "1984"
          }
        ],
        "b2": [
          {
            "_docID": "bae-7e637e18-7c15-5ed9-a5bf-aea644e5fcb6",
            "title": "Lord of the Flies"
          }
        ]
      }
    }
    ```
  </TabItem>
  <TabItem value="http" label="HTTP API">
    ```http title="Create two documents"
    POST http://localhost:9181/api/v1/collections/Book HTTP/2
    accept: application/json
    content-type: application/json
    
    [
      {
        "title": "1984",
        "genre": "Fiction",
        "plot": "A masterpiece of rebellion and imprisonment where war is peace, freedom is slavery, and Big Brother is watching.",
        "rating": 4.20
      },
      {
        "title": "Lord of the Flies",
        "genre": "Fiction",
        "plot": "At the dawn of the next world war, a plane crashes on an uncharted island, stranding a group of schoolboys.",
        "rating": 3.70
      }
    ]
    ```
  </TabItem>
  <TabItem value="graphql" label="GraphQL API">
    To avoid clashes, you need to [alias](aliases.md) the results (`b1` and `b2` in the example). The aliases are used as keys in the result json.

    ```graphql title="Create two documents"
    mutation {
      # highlight-next-line
      b1:add_Book(input: {
        title: "1984",
        genre: "Fiction",
        plot: "A masterpiece of rebellion and imprisonment where war is peace, freedom is slavery, and Big Brother is watching.",
        rating: 4.20
      }) {
        _docID
        title
      }
      # highlight-next-line
      b2:add_Book(input: {
        title: "Lord of the Flies",
        genre: "Fiction",
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
            "_docID": "bae-87c50a88-e1de-5df9-9659-cfe52d10dc7a",
            "title": "1984"
          }
        ],
        "b2": [
          {
            "_docID": "bae-7e637e18-7c15-5ed9-a5bf-aea644e5fcb6",
            "title": "Lord of the Flies"
          }
        ]
      }
    }
    ```
  </TabItem>
</Tabs>
