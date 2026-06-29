---
title: Query the database
description: How to retrieve documents from a DefraDB database.
---

Once you have [created some documents](mutation-create.md), you can query the database for them. Time to claim your stuff back.

<details>
  <summary>Display database setup</summary>
  
  This page assumes your database contains `Book` and `Person` [collections](/schema/collections.md) and some documents in them:

  ```graphql title="Database schema" test-setup-collection
  type Person {
    name: String
    authoredBooks: [Book]
  }

  type Company {
    name: String!
    sells: [Book]
  }

  type Book {
    title: String!
    genre: String
    plot: String
    rating: Float
    author: Person
    seller: Company
  }
  ```
  ```graphql title="Documents setup" test-setup-data
  mutation {
    c1:add_Company(input: {
      name: "The Indipendent Hipster Bookshop"
    }) { _docID name }
    c2:add_Company(input: {
      name: "The World-Destroying Large Chain"
    }) { _docID name }
  
    a1:add_Person(input: {
      name: "George Orwell"
    }) { _docID name }
    a2:add_Person(input: {
      name: "William Golding"
    }) { _docID name }
    a3:add_Person(input: {
      name: "David Foster Wallace"
    }) { _docID name }
    a4:add_Person(input: {
      name: "Victor Hugo"
    }) { _docID name }

    b11:add_Book(input: {
      title: "1984",
      genre: "Fiction",
      plot: "A masterpiece of rebellion and imprisonment where war is peace, freedom is slavery, and Big Brother is watching.",
      rating: 4.20,
      _authorID: "bae-3517d1eb-351b-5231-8387-870893ffb395",
      _sellerID: "bae-dd31ceba-9ffd-57b6-b6b2-365081ef4b7a"
    }) { _docID title }
    b12:add_Book(input: {
      title: "Down and Out in Paris and London",
      genre: "Biography",
      plot: "The adventures of a penniless British writer among the down-and-outs of two great cities.",
      rating: 4.09,
      _authorID: "bae-3517d1eb-351b-5231-8387-870893ffb395",
      _sellerID: "bae-dd31ceba-9ffd-57b6-b6b2-365081ef4b7a"
    }) { _docID title }
    b21:add_Book(input: {
      title: "Lord of the Flies",
      genre: "Fiction",
      plot: "At the dawn of the next world war, a plane crashes on an uncharted island, stranding a group of schoolboys.",
      rating: 3.70,
      _authorID: "bae-78e9c7be-10b9-5673-bad2-da3341367d4b",
      _sellerID: "bae-e467e3b8-9ba5-52b4-ae6b-4499f2f0c483"
    }) { _docID title }
    b31:add_Book(input: {
      title: "Infinite Jest",
      genre: "Fiction",
      plot: "A gargantuan, mind-altering tragi-comedy about the Pursuit of Happiness in America.",
      rating: 4.25
      _authorID: "bae-b59928dc-fd05-5fb7-aea2-9b24af5ebcea",
      _sellerID: "bae-dd31ceba-9ffd-57b6-b6b2-365081ef4b7a"
    }) { _docID title }
    b32:add_Book(input: {
      title: "Consider the Lobster and Other Essays",
      genre: "Nonfiction",
      plot: "Do lobsters feel pain? Did Franz Kafka have a funny bone? What is John Updike's deal, anyway? And what happens when adult video starlets meet their fans in person? Essays that are also enthralling narrative adventures.",
      rating: 4.18,
      _authorID: "bae-b59928dc-fd05-5fb7-aea2-9b24af5ebcea",
      _sellerID: "bae-e467e3b8-9ba5-52b4-ae6b-4499f2f0c483"
    }) { _docID title }
    b41:add_Book(input: {
      title: "Les Misérables",
      genre: "Fiction",
      plot: "Victor Hugo's tale of injustice, heroism and love follows the fortunes of Jean Valjean, an escaped convict determined to put his criminal past behind him.",
      rating: 4.21,
      _authorID: "bae-c169e917-df52-5603-9224-39c1757f1b04",
      _sellerID: "bae-e467e3b8-9ba5-52b4-ae6b-4499f2f0c483"
    }) { _docID title }
  }
  ```
</details>

## Anatomy of a query block {/* #syntax */}

```graphql title="Syntax &ndash; Query block" test-skip
{
  TYPE(
    filter: object, docID: [ID],
    order: [object],
    limit: int, offset: int,
    orderBy: [object]
  ) {
    [returnfield]
  }
}
```
- `TYPE` &ndash; Name of the [collection](schema/collections.md) to query.
- `filter`, `docID` &ndash; Criteria for documents to select, see [Filter documents](filter.md).
- `order` &ndash; Results sorting fields, see [Sort results](order.md).
- `limit`, `offset` &ndash; Number of results to return/skip, see [Limit and paginate results](limit-paginate.md).
- `groupBy` &ndash; Fields to group results by, see [Group results](group.md).
- `[field]` &ndash; List of fields to return for the selected documents. Queries return the exact fields requested (GraphQL has no equivalent of the SQL `SELECT *` syntax).

```graphql title="Example query &ndash; Filter books by genre and author's name; return 3 ordered by title"
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

## Run a query {/* #run */}

The basic skeleton of a query is made of the type/collection you want to fetch from (ex. `Book`) and the fields you want to return among the ones defined on the collection (ex. `title`, `plot`). `_docID` is a return field available available on any type.

<Tabs groupId="defra">
  <TabItem value="cli" label="CLI" default>
    Run a query via the CLI command [`defradb client query`](/references/cli/defradb_client_query.md).

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
            "_docID": "bae-8a6c163a-29cd-5607-a965-199487e58b00",
            "plot": "Victor Hugo's tale of injustice, heroism and love follows the fortunes of Jean Valjean, an escaped convict determined to put his criminal past behind him.",
            "title": "Les Misérables"
          },
          {
            "_docID": "bae-92465255-4869-5994-9898-83576ee9ff60",
            "plot": "The adventures of a penniless British writer among the down-and-outs of two great cities.",
            "title": "Down and Out in Paris and London"
          },
          {
            "_docID": "bae-9579541e-f15d-506e-a74a-63d00cb3ab56",
            "plot": "At the dawn of the next world war, a plane crashes on an uncharted island, stranding a group of schoolboys.",
            "title": "Lord of the Flies"
          },
          {
            "_docID": "bae-a3dad950-43cc-5f03-9b33-b61ebc936ac4",
            "plot": "Do lobsters feel pain? Did Franz Kafka have a funny bone? What is John Updike's deal, anyway? And what happens when adult video starlets meet their fans in person? Essays that are also enthralling narrative adventures.",
            "title": "Consider the Lobster and Other Essays"
          },
          {
            "_docID": "bae-c26135f1-59d6-5f32-a7c0-16dbec525abe",
            "plot": "A gargantuan, mind-altering tragi-comedy about the Pursuit of Happiness in America.",
            "title": "Infinite Jest"
          }
        ]
      }
    }
    ```
  </TabItem>
  <TabItem value="http" label="HTTP API">
    Run a query by submitting a `POST` request to the HTTP endpoint [`/api/v1/graphql`](/defradb/references/http/api/post-graphql/). The body must be a JSON object, with the DQL query under the `query` key. Newlines are not supported within the `query` string field.

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
            "_docID": "bae-8a6c163a-29cd-5607-a965-199487e58b00",
            "plot": "Victor Hugo's tale of injustice, heroism and love follows the fortunes of Jean Valjean, an escaped convict determined to put his criminal past behind him.",
            "title": "Les Misérables"
          },
          {
            "_docID": "bae-92465255-4869-5994-9898-83576ee9ff60",
            "plot": "The adventures of a penniless British writer among the down-and-outs of two great cities.",
            "title": "Down and Out in Paris and London"
          },
          {
            "_docID": "bae-9579541e-f15d-506e-a74a-63d00cb3ab56",
            "plot": "At the dawn of the next world war, a plane crashes on an uncharted island, stranding a group of schoolboys.",
            "title": "Lord of the Flies"
          },
          {
            "_docID": "bae-a3dad950-43cc-5f03-9b33-b61ebc936ac4",
            "plot": "Do lobsters feel pain? Did Franz Kafka have a funny bone? What is John Updike's deal, anyway? And what happens when adult video starlets meet their fans in person? Essays that are also enthralling narrative adventures.",
            "title": "Consider the Lobster and Other Essays"
          },
          {
            "_docID": "bae-c26135f1-59d6-5f32-a7c0-16dbec525abe",
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
            "_docID": "bae-526a42c6-c147-57e4-89e0-875d27a1532d",
            "plot": "A masterpiece of rebellion and imprisonment where war is peace, freedom is slavery, and Big Brother is watching.",
            "title": "1984"
          },
          {
            "_docID": "bae-8a6c163a-29cd-5607-a965-199487e58b00",
            "plot": "Victor Hugo's tale of injustice, heroism and love follows the fortunes of Jean Valjean, an escaped convict determined to put his criminal past behind him.",
            "title": "Les Misérables"
          },
          {
            "_docID": "bae-92465255-4869-5994-9898-83576ee9ff60",
            "plot": "The adventures of a penniless British writer among the down-and-outs of two great cities.",
            "title": "Down and Out in Paris and London"
          },
          {
            "_docID": "bae-9579541e-f15d-506e-a74a-63d00cb3ab56",
            "plot": "At the dawn of the next world war, a plane crashes on an uncharted island, stranding a group of schoolboys.",
            "title": "Lord of the Flies"
          },
          {
            "_docID": "bae-a3dad950-43cc-5f03-9b33-b61ebc936ac4",
            "plot": "Do lobsters feel pain? Did Franz Kafka have a funny bone? What is John Updike's deal, anyway? And what happens when adult video starlets meet their fans in person? Essays that are also enthralling narrative adventures.",
            "title": "Consider the Lobster and Other Essays"
          },
          {
            "_docID": "bae-c26135f1-59d6-5f32-a7c0-16dbec525abe",
            "plot": "A gargantuan, mind-altering tragi-comedy about the Pursuit of Happiness in America.",
            "title": "Infinite Jest"
          }
        ]
      }
    }
    ```
  </TabItem>
</Tabs>

## Relationships {/* #relationships */}

If a document contains a relationship to another document, the return fields can include the fields of the linked document. This applies both for one-to-one and to one-to-many relationships, and to both sides of the relationship.

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
            "title": "1984"
          },
          {
            "title": "Down and Out in Paris and London"
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
              "name": "The Indipendent Hipster Bookshop"
            },
            "title": "1984"
          },
          {
            "seller": {
              "name": "The Indipendent Hipster Bookshop"
            },
            "title": "Down and Out in Paris and London"
          }
        ],
        "name": "George Orwell"
      },
      {
        "authoredBooks": [
          {
            "seller": {
              "name": "The World-Destroying Large Chain"
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
              "name": "The World-Destroying Large Chain"
            },
            "title": "Consider the Lobster and Other Essays"
          },
          {
            "seller": {
              "name": "The Indipendent Hipster Bookshop"
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
              "name": "The World-Destroying Large Chain"
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

## Get documents by ID {/* #get-by-id */}

Query the database for a specific document ID via the `docID` argument in the type constructor. You can query for one or more documents by providing either a string or a list of strings.

```graphql title="Get one author by ID and return his books"
{
  # highlight-next-line
  Person(docID: "bae-3517d1eb-351b-5231-8387-870893ffb395") {
    name
    authoredBooks { title }
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
            "title": "1984"
          },
          {
            "title": "Down and Out in Paris and London"
          }
        ],
        "name": "George Orwell"
      }
    ]
  }
}
```

```graphql title="Get several authors by ID and return their books"
{
  Person(
    # highlight-start
    docID: [
      "bae-3517d1eb-351b-5231-8387-870893ffb395",
      "bae-b59928dc-fd05-5fb7-aea2-9b24af5ebcea"
    ]
    # highlight-end
  ) {
    name
    authoredBooks { title }
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
            "title": "1984"
          },
          {
            "title": "Down and Out in Paris and London"
          }
        ],
        "name": "George Orwell"
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
      }
    ]
  }
}
```

:::tip
If both `filter` and `docID` are given, both criteria must be fulfilled for a document to be selected.
:::

{/*
## Run different query parts

```
{
"operationName":"U",
  "query": "query U{ Book { _docID title plot } } query B{ Book { _docID title plot } }"
}
```
*/}
