---
title: Create new documents
description: How to use the add_<type> GraphQL mutation to insert new documents in DefraDB.
---

Once you have [created collections](/schema/collections.md), you can start adding documents into them. 

<details>
  <summary>Display database setup</summary>
  
  To reproduce the example results from this page, your database needs the following setup.

  ```graphql title="Database schema" test-setup-collection
  type Person {
    name: String!
    authoredBooks: [Book]
  }

  type Book {
    title: String!
    genre: String
    plot: String
    rating: Float
    author: Person
  }
  ```
</details>

## Syntax  {/* #syntax */}

You create documents via the `add_TYPE` mutation. The mutation returns the new documents.

```graphql title="Syntax &ndash; Add mutation" test-skip
mutation {
  add_TYPE(input: docObj) { [returnField] }
}
```
- `TYPE` &ndash; A [collection](schema/collections.md) name.
- `docObj` &ndash; JSON-like object containing the document details.
- `[returnField]` &ndash; List of fields to return for the created documents.

## Single document {/* #single */}

<Tabs groupId="defra">
  <TabItem value="cli" label="CLI" default>
    To create a document of a given `<type>`, use the mutation `add_<type>` via the CLI command [`defradb client query`](/references/cli/defradb_client_query.md). For example, use `add_Book` to create a document in the `Book` collection.

    Every `add_<type>` mutation must return some of the inserted information. Because GraphQL queries only return the exact fields requested, you have to provide a list of return fields (there is no equivalent of the SQL `SELECT *` syntax).

    ```shell title='Create a new document of type "Book"'
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
    ```json title="Result" result
    {
      "data": {
        "add_Book": [
          {
            "_docID": "bae-db5131b2-2e79-5ae8-ab8b-df35c2b939e1",
            "title": "Infinite Jest"
          }
        ]
      }
    }
    ```
  </TabItem>
  <TabItem value="http" label="HTTP API">
    To create a document of a given `<type>`, submit a POST request to the HTTP endpoint [`/api/v1/collections/<type>`](/defradb/references/http/api/add-document/). For example, submit a request to `/api/v1/collections/Book`. The request body should contain the document information in JSON format.

    ```http title='Create a new document of type "Book"'
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
    To create a document of a given `<type>`, use the mutation `add_<type>`. For example, to create a document in the `Book` collection, use `add_Book`.

    Every `add_<type>` mutation must return some of the inserted information. Because GraphQL queries only return the exact fields requested, you have to provide a list of return fields (there is no equivalent of the SQL `SELECT *` syntax).
    
    ```graphql title='Create a new document of type "Book"'
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
    ```json title="Result" result
    {
      "data": {
        "add_Book": [
          {
            "_docID": "bae-db5131b2-2e79-5ae8-ab8b-df35c2b939e1",
            "title": "Infinite Jest"
          }
        ]
      }
    }
    ```
  </TabItem>
</Tabs>

:::tip The document ID
The field `_docID` contains the document's unique identifier. The document data might change over time, but its docID will stay the same. The `_docID` field is [automatically indexed](/schema/indexes.md).
:::

## Multiple documents {/* #multiple */}

<Tabs groupId="defra">
  <TabItem value="cli" label="CLI" default>
    You can create multiple documents in the same request by concatenating several `add_<type>` statements.
    To avoid clashes, you need to [alias](aliases.md) the results (`b1` and `b2` in the example). The aliases are used as keys in the result JSON.

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
        title
      }
      # highlight-next-line
      b2:add_Book(input: {
        title: "Lord of the Flies",
        genre: "Fiction",
        plot: "At the dawn of the next world war, a plane crashes on an uncharted island, stranding a group of schoolboys.",
        rating: 3.70
      }) {
        title
      }
    }
    '
    ```
    ```json title="Result" result
    {
      "data": {
        "b1": [
          {
            "title": "1984"
          }
        ],
        "b2": [
          {
            "title": "Lord of the Flies"
          }
        ]
      }
    }
    ```
  </TabItem>
  <TabItem value="http" label="HTTP API">
    You can create multiple documents in the same request by providing a JSON list object to the `/api/v1/collections/<type>` endpoint.
    
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
    You can create multiple documents in the same request by concatenating several `add_<type>` statements.
    To avoid clashes, you need to [alias](aliases.md) the results (`b1` and `b2` in the example). The aliases are used as keys in the result JSON.

    ```graphql title="Create two documents"
    mutation {
      # highlight-next-line
      b1:add_Book(input: {
        title: "1984",
        genre: "Fiction",
        plot: "A masterpiece of rebellion and imprisonment where war is peace, freedom is slavery, and Big Brother is watching.",
        rating: 4.20
      }) {
        title
      }
      # highlight-next-line
      b2:add_Book(input: {
        title: "Lord of the Flies",
        genre: "Fiction",
        plot: "At the dawn of the next world war, a plane crashes on an uncharted island, stranding a group of schoolboys.",
        rating: 3.70
      }) {
        title
      }
    }
    ```
    ```json title="Result" result
    {
      "data": {
        "b1": [
          {
            "title": "1984"
          }
        ],
        "b2": [
          {
            "title": "Lord of the Flies"
          }
        ]
      }
    }
    ```
  </TabItem>
</Tabs>

## Relationships {/* #relationships */}

To create a relationship between two documents, you need to store the docID of one document into the relationship field of the other. Each [relationship field](/schema/collections.md#relationships) results in a `_<fieldName>ID` field: for example, the type `Book` has a field `author: Person`, so a field `_authorID` is automatically available. Use this field to store the pointer to the docID of a `Person` document.

For example, to create a book and link it to an author, first create the documents and return their docIDs:

```graphql title='Create new documents for "Person" and "Book"'
mutation {
  add_Person(input: {
    name: "Victor Hugo"
  }) {
    _docID
    name
  }
  add_Book(input: {
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
```json title="Result" result
{
  "data": {
    "add_Book": [
      {
        "_docID": "bae-097c416c-bb66-5947-b241-c462464ea41d",
        "title": "Les Misérables"
      }
    ],
    "add_Person": [
      {
        "_docID": "bae-4bfe5f4c-d668-5dc3-9de2-eb598af3da7d",
        "name": "Victor Hugo"
      }
    ]
  }
}
```

Then create a relationship between them via an [update mutation](/dql/mutation-update.md) to set the field `_authorID` on `Book` with the docID from the desired `Person`:

```graphql title="Link book and author via Book._authorID"
mutation {
  update_Book(
    docID: "bae-097c416c-bb66-5947-b241-c462464ea41d",
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
```json title="Result" result
{
  "data": {
    "update_Book": [
      {
        "_authorID": "bae-c169e917-df52-5603-9224-39c1757f1b04",
        "_docID": "bae-097c416c-bb66-5947-b241-c462464ea41d",
        "title": "Les Misérables"
      }
    ]
  }
}
```

## JSON fields {/* #json-fields */}

JSON fields expect the value to be an unserialized object, not its string representation.

{/*
```graphql title='Schema for "jsonBlob" collection' test-setup-collection
type jsonBlob {
  jsonField: JSON @index
}
```
*/}

```graphql title="Valid &ndash; JSON unserialized object" valid
#valid
mutation {
  add_jsonBlob(input: {
    jsonField: {
      i: {
        love: "eating my family and commas"
      }
    }
  }) { jsonField }
}
```
```graphql title="Invalid &ndash; JSON string representation" invalid
#invalid
mutation {
  add_jsonBlob(input: {
    jsonField: "{\"i\": {\"love\": \"eating my family and commas\"}}"
  }) { jsonField }
}
```