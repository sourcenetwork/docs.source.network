---
title: Create new documents
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

Once you have [created collections](/collections/create.md), you can start adding documents into them. This page assumes your database contains `Book` and `Person` collections:

```graphql title="Database schema"
type Person {
  name: String
}

type Book {
  title: String
  plot: String
  rating: Float
  author: Person
}
```

## Create one new document

<Tabs groupId="defra">
  <TabItem value="cli" label="CLI" default>
    You can create new documents into `<collection>` via the mutation `add_<collection>` and the CLI command [`defradb client query`](/references/cli/defradb_client_query.md).

    ```shell title="Create a new document of type Book"
    defradb client query '
      mutation {
        add_Book(input: {
          title: "Infinite Jest",
          plot: "A gargantuan, mind-altering tragi-comedy about the Pursuit of Happiness in America.",
          rating: 4.25
        })
      }
    '
    ```
  </TabItem>
  <TabItem value="http" label="HTTP API">
    You can create new documents into `<collection>` via POST requests to the HTTP endpoint [`/api/v1/collections/<collection>`](/defradb/references/http/api/add-document/). The request body should contain the document information in JSON format.

    ```json title="Create a new document of type Book"
    POST http://localhost:9181/api/v1/collections/Book
    
    {
      "title": "Infinite Jest",
      "plot": "A gargantuan, mind-altering tragi-comedy about the Pursuit of Happiness in America.",
      "rating": 4.25
    }
    ```
  </TabItem>
  <TabItem value="graphql" label="GraphQL API">
    You can create new documents into `<collection>` via the mutation `add_<collection>`.

    ```graphql title="Create a new document of type Book"
    mutation {
      add_Book(input: {
        title: "Infinite Jest",
        plot: "A gargantuan, mind-altering tragi-comedy about the Pursuit of Happiness in America.",
        rating: 4.25
      })
    }
    ```
  </TabItem>
</Tabs>

## Create and return one document

To output some of the inserted information, provide a list of fields to be returned.

<Tabs groupId="defra">
  <TabItem value="cli" label="CLI" default>
    ```shell title="Create a new document and return some fields"
    defradb client query '
      mutation {
        add_Book(input: {
          title: "Infinite Jest",
          plot: "A gargantuan, mind-altering tragi-comedy about the Pursuit of Happiness in America.",
          rating: 4.25
        // highlight-start
        }) {
          _docID
          title
        }
        // highlight-end
      }
    '
    ```
  </TabItem>
  <TabItem value="graphql" label="GraphQL API">
    ```graphql title="Create a new document and return some fields"
    mutation {
      add_Book(input: {
        title: "Infinite Jest",
        plot: "A gargantuan, mind-altering tragi-comedy about the Pursuit of Happiness in America.",
        rating: 4.25
      // highlight-start
      }) {
        _docID
        title
      }
      // highlight-end
    }
    ```
  </TabItem>
</Tabs>

```json title="Result"
{
  "data": {
    "add_Book": [
      {
        "_docID": "bae-429075e7-f4b2-5fa6-aa03-380ecdad0703",
        "title": "Infinite Jest"
      }
    ]
  }
}
```

:::tip
`_docID` is the document's unique identifier, determined by the collection it belongs to and the data it is initialized with.
:::

## Create multiple documents at once

You can create (and return) multiple documents in the same request by concatenating several `add_<collection>` statements.
To avoid clashes, you need to [alias](aliases.md) the results.

<Tabs groupId="defra">
  <TabItem value="cli" label="CLI" default>
    ```shell title="Create two documents"
    defradb client query '
      mutation {
      // highlight-next-line
      b1:add_Book(input: {
        title: "1984",
        plot: "A masterpiece of rebellion and imprisonment where war is peace, freedom is slavery, and Big Brother is watching.",
        rating: 4.20
      }) {
        _docID
        title
      }
      // highlight-next-line
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
  <TabItem value="graphql" label="GraphQL API">
    ```graphql title="Create two documents"
    mutation {
      // highlight-next-line
      b1:add_Book(input: {
        title: "1984",
        plot: "A masterpiece of rebellion and imprisonment where war is peace, freedom is slavery, and Big Brother is watching.",
        rating: 4.20
      }) {
        _docID
        title
      }
      // highlight-next-line
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
  </TabItem>
</Tabs>

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

## Create documents with relationships

to add with relationships

```graphql title="Create a new document"
mutation {
  v:add_Person(input: {
    name: Victor Hugo
  }
  b:add_Book(input: {
    title: "Les Misérables",
    plot: "Victor Hugo's tale of injustice, heroism and love follows the fortunes of Jean Valjean, an escaped convict determined to put his criminal past behind him.",
    rating: 4.21
    author: v
  }) {
    title
    author
  }
}
```
