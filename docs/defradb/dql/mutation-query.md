---
title: Query the database
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

Once you have [created some documents](mutation-create.md), you can query the database for them.

<details>
  <summary>Display database setup</summary>
  
  This page assumes your database contains `Book` and `Person` [collections](/schema/collections.md) and some documents in them:

  ```graphql title="Database schema" test-setup-collection
  type Person {
    name: String
    authoredBooks: [Book]
  }

  type Company {
    name: String
    sells: [Book]
  }

  type Book {
    title: String
    genre: String
    plot: String
    rating: Float
    author: Person
    seller: Company
  }
  ```
  ```graphql title="Company documents setup" test-setup-data
  mutation {
    c1:add_Company(input: {
      name: "The indipendent hipster bookshop"
    }) { _docID }
    c2:add_Company(input: {
      name: "The world-destroying large chain"
    }) { _docID }
  }
  ```
  ```graphql title="Person documents setup" test-setup-data
  mutation {
    a1:add_Person(input: {
      name: "George Orwell"
    }) { _docID }
    a2:add_Person(input: {
      name: "William Golding"
    }) { _docID }
    a3:add_Person(input: {
      name: "David Foster Wallace"
    }) { _docID }
    a4:add_Person(input: {
      name: "Victor Hugo"
    }) { _docID }
  }
  ```
  ```graphql title="Book documents setup" test-setup-data
  mutation {
    b11:add_Book(input: {
      title: "1984",
      genre: "Fiction",
      plot: "A masterpiece of rebellion and imprisonment where war is peace, freedom is slavery, and Big Brother is watching.",
      rating: 4.20,
      _authorID: "bae-3517d1eb-351b-5231-8387-870893ffb395",
      _sellerID: "bae-e1cae0d8-391a-5a85-be36-62455d731f18"
    }) {
      _docID
      title
    }
    b12:add_Book(input: {
      title: "Down and Out in Paris and London",
      genre: "Biography",
      plot: "The adventures of a penniless British writer among the down-and-outs of two great cities.",
      rating: 4.09,
      _authorID: "bae-3517d1eb-351b-5231-8387-870893ffb395",
      _sellerID: "bae-e1cae0d8-391a-5a85-be36-62455d731f18"
    }) {
      _docID
      title
    }
    b21:add_Book(input: {
      title: "Lord of the Flies",
      genre: "Fiction",
      plot: "At the dawn of the next world war, a plane crashes on an uncharted island, stranding a group of schoolboys.",
      rating: 3.70,
      _authorID: "bae-78e9c7be-10b9-5673-bad2-da3341367d4b",
      _sellerID: "bae-9b2b0b42-c6a4-5678-8be3-4137699b4e65"
    }) {
      _docID
      title
    }
    b31:add_Book(input: {
      title: "Infinite Jest",
      genre: "Fiction",
      plot: "A gargantuan, mind-altering tragi-comedy about the Pursuit of Happiness in America.",
      rating: 4.25
      _authorID: "bae-b59928dc-fd05-5fb7-aea2-9b24af5ebcea",
      _sellerID: "bae-e1cae0d8-391a-5a85-be36-62455d731f18"
    }) {
      _docID
      title
    }
    b32:add_Book(input: {
      title: "Consider the Lobster and Other Essays",
      genre: "Nonfiction",
      plot: "Do lobsters feel pain? Did Franz Kafka have a funny bone? What is John Updike's deal, anyway? And what happens when adult video starlets meet their fans in person? Essays that are also enthralling narrative adventures.",
      rating: 4.18,
      _authorID: "bae-b59928dc-fd05-5fb7-aea2-9b24af5ebcea",
      _sellerID: "bae-9b2b0b42-c6a4-5678-8be3-4137699b4e65"
    }) {
      _docID
      title
    }
    b41:add_Book(input: {
      title: "Les Misérables",
      genre: "Fiction",
      plot: "Victor Hugo's tale of injustice, heroism and love follows the fortunes of Jean Valjean, an escaped convict determined to put his criminal past behind him.",
      rating: 4.21,
      _authorID: "bae-c169e917-df52-5603-9224-39c1757f1b04",
      _sellerID: "bae-9b2b0b42-c6a4-5678-8be3-4137699b4e65"
    }) {
      _docID
      title
    }
  }
  ```
</details>

## Query blocks

GraphQL queries have the following form:

```graphql title="Syntax" test-skip
{
  TYPE(args) {
    [returnField]
  }
}
```
- `TYPE` &ndash; Name of the collection to query.
- `args` &ndash; Arguments for directing the query, such as [filtering](filter.md), [sorting](sorting-and-ordering.md), [grouping](grouping.md), [skipping/limiting](limiting-and-pagination.md).
- `[returnField]` &ndash; A list of fields to return for the matched documents. Queries only return the exact fields requested (GraphQL has no equivalent of the `SQL SELECT *` syntax).

```graphql title="Example query &ndash; Filter books by genre and author's name"
{
  Book(filter: {
    genre: { _eq: "Fiction" },
    author: { name: { _eq: "George Orwell" } }
  }, limit: 3) {
    title
    plot
    author {
      name
    }
  }
}
```

## Run a query

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
            "_docID": "bae-1b57692a-3412-5efd-a0d7-726d1c2d1985",
            "plot": "Victor Hugo's tale of injustice, heroism and love follows the fortunes of Jean Valjean, an escaped convict determined to put his criminal past behind him.",
            "title": "Les Misérables"
          },
          {
            "_docID": "bae-1b669ad4-6de9-5916-bf9e-efbd9ca6ac95",
            "plot": "At the dawn of the next world war, a plane crashes on an uncharted island, stranding a group of schoolboys.",
            "title": "Lord of the Flies"
          },
          {
            "_docID": "bae-32b88360-3cef-5a0d-a85f-8f1bf9faa873",
            "plot": "The adventures of a penniless British writer among the down-and-outs of two great cities.",
            "title": "Down and Out in Paris and London"
          },
          {
            "_docID": "bae-a816dce7-bd09-5728-a272-ef97e8552973",
            "plot": "A masterpiece of rebellion and imprisonment where war is peace, freedom is slavery, and Big Brother is watching.",
            "title": "1984"
          },
          {
            "_docID": "bae-aa5eb5c3-e6e9-55ff-b19c-08b2ffb63172",
            "plot": "Do lobsters feel pain? Did Franz Kafka have a funny bone? What is John Updike's deal, anyway? And what happens when adult video starlets meet their fans in person? Essays that are also enthralling narrative adventures.",
            "title": "Consider the Lobster and Other Essays"
          },
          {
            "_docID": "bae-fa83f9f4-e4ed-5db5-a926-13e42260be2b",
            "plot": "A gargantuan, mind-altering tragi-comedy about the Pursuit of Happiness in America.",
            "title": "Infinite Jest"
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
            "_docID": "bae-1b57692a-3412-5efd-a0d7-726d1c2d1985",
            "plot": "Victor Hugo's tale of injustice, heroism and love follows the fortunes of Jean Valjean, an escaped convict determined to put his criminal past behind him.",
            "title": "Les Misérables"
          },
          {
            "_docID": "bae-1b669ad4-6de9-5916-bf9e-efbd9ca6ac95",
            "plot": "At the dawn of the next world war, a plane crashes on an uncharted island, stranding a group of schoolboys.",
            "title": "Lord of the Flies"
          },
          {
            "_docID": "bae-32b88360-3cef-5a0d-a85f-8f1bf9faa873",
            "plot": "The adventures of a penniless British writer among the down-and-outs of two great cities.",
            "title": "Down and Out in Paris and London"
          },
          {
            "_docID": "bae-a816dce7-bd09-5728-a272-ef97e8552973",
            "plot": "A masterpiece of rebellion and imprisonment where war is peace, freedom is slavery, and Big Brother is watching.",
            "title": "1984"
          },
          {
            "_docID": "bae-aa5eb5c3-e6e9-55ff-b19c-08b2ffb63172",
            "plot": "Do lobsters feel pain? Did Franz Kafka have a funny bone? What is John Updike's deal, anyway? And what happens when adult video starlets meet their fans in person? Essays that are also enthralling narrative adventures.",
            "title": "Consider the Lobster and Other Essays"
          },
          {
            "_docID": "bae-fa83f9f4-e4ed-5db5-a926-13e42260be2b",
            "plot": "A gargantuan, mind-altering tragi-comedy about the Pursuit of Happiness in America.",
            "title": "Infinite Jest"
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
            "_docID": "bae-1b57692a-3412-5efd-a0d7-726d1c2d1985",
            "plot": "Victor Hugo's tale of injustice, heroism and love follows the fortunes of Jean Valjean, an escaped convict determined to put his criminal past behind him.",
            "title": "Les Misérables"
          },
          {
            "_docID": "bae-1b669ad4-6de9-5916-bf9e-efbd9ca6ac95",
            "plot": "At the dawn of the next world war, a plane crashes on an uncharted island, stranding a group of schoolboys.",
            "title": "Lord of the Flies"
          },
          {
            "_docID": "bae-32b88360-3cef-5a0d-a85f-8f1bf9faa873",
            "plot": "The adventures of a penniless British writer among the down-and-outs of two great cities.",
            "title": "Down and Out in Paris and London"
          },
          {
            "_docID": "bae-a816dce7-bd09-5728-a272-ef97e8552973",
            "plot": "A masterpiece of rebellion and imprisonment where war is peace, freedom is slavery, and Big Brother is watching.",
            "title": "1984"
          },
          {
            "_docID": "bae-aa5eb5c3-e6e9-55ff-b19c-08b2ffb63172",
            "plot": "Do lobsters feel pain? Did Franz Kafka have a funny bone? What is John Updike's deal, anyway? And what happens when adult video starlets meet their fans in person? Essays that are also enthralling narrative adventures.",
            "title": "Consider the Lobster and Other Essays"
          },
          {
            "_docID": "bae-fa83f9f4-e4ed-5db5-a926-13e42260be2b",
            "plot": "A gargantuan, mind-altering tragi-comedy about the Pursuit of Happiness in America.",
            "title": "Infinite Jest"
          }
        ]
      }
    }
    ```
  </TabItem>
</Tabs>

## Relationships

When a document contains a relationship to another document, the return fields can include the fields of the linked document. This applies both for one-to-one and to one-to-many relationships, and to both sides of the relationship.

```graphql title="Retrieve all persons and the titles of their authored books"
{
  Person {
    authoredBooks {
      title
    }
    name
  }
}
```
```json title="Result"
{
  "data": {
    "Person": [
      {
        "authoredBooks": [
          {
            "title": "Down and Out in Paris and London"
          },
          {
            "title": "1984"
          }
        ],
        "name": "George Orwell"
      },
      {
        "authoredBooks": [
          {
            "title": "Lord of the Flies"
          }
        ],
        "name": "William Golding"
      },
      {
        "authoredBooks": [
          {
            "title": "Consider the Lobster and Other Essays"
          },
          {
            "title": "Infinite Jest"
          }
        ],
        "name": "David Foster Wallace"
      },
      {
        "authoredBooks": [
          {
            "title": "Les Misérables"
          }
        ],
        "name": "Victor Hugo"
      }
    ]
  }
}
```

You can walk connected types without boundaries: if type `Person` has a relationships with type `Book`, which has a relationship with type `Company`, you can query `Person` and return `Person.Book.Company.<field>`. The result will reflect the nested structure of the documents.

```graphql title="Retrieve all persons and the titles of their authored books"
{
  Person {
    authoredBooks {
      title
      seller {
        name
      }
    }
    name
  }
}
```
```json title="Result"
{
  "data": {
    "Person": [
      {
        "authoredBooks": [
          {
            "seller": {
              "name": "The indipendent hipster bookshop"
            },
            "title": "Down and Out in Paris and London"
          },
          {
            "seller": {
              "name": "The indipendent hipster bookshop"
            },
            "title": "1984"
          }
        ],
        "name": "George Orwell"
      },
      {
        "authoredBooks": [
          {
            "seller": {
              "name": "The world-destroying large chain"
            },
            "title": "Lord of the Flies"
          }
        ],
        "name": "William Golding"
      },
      {
        "authoredBooks": [
          {
            "seller": {
              "name": "The world-destroying large chain"
            },
            "title": "Consider the Lobster and Other Essays"
          },
          {
            "seller": {
              "name": "The indipendent hipster bookshop"
            },
            "title": "Infinite Jest"
          }
        ],
        "name": "David Foster Wallace"
      },
      {
        "authoredBooks": [
          {
            "seller": {
              "name": "The world-destroying large chain"
            },
            "title": "Les Misérables"
          }
        ],
        "name": "Victor Hugo"
      }
    ]
  }
}
```

## Use variables

## Run different query parts
```
{
"operationName":"U",
  "query": "query U{ Book { _docID title plot } } query B{ Book { _docID title plot } }"
}
```
