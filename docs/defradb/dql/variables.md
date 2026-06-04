---
title: Query variables
---

For simplicity, most examples have hardcoded values in queries. Although that is fine for understanding and prototyping, it is **not** fine for production applications. For *oh god so many* reasons:

- Your application becomes vulnerable to GraphQL injections. Any user input you miss to sanitize is a hazard.
- Your application has to dynamically build each query with string interpolation.
- The database receives a bunch of different queries which are just different flavors of the same query, but can't cache them efficiently because of their apparent difference. 

The best practice is thus to use variables for all values that might change over different query runs. This is especially relevant when using [filters](filter.md).

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
      name: "The Indipendent Hipster Bookshop"
    }) { _docID }
    c2:add_Company(input: {
      name: "The World-Destroying Large Chain"
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
      _sellerID: "bae-dd31ceba-9ffd-57b6-b6b2-365081ef4b7a"
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
      _sellerID: "bae-dd31ceba-9ffd-57b6-b6b2-365081ef4b7a"
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
      _sellerID: "bae-e467e3b8-9ba5-52b4-ae6b-4499f2f0c483"
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
      _sellerID: "bae-dd31ceba-9ffd-57b6-b6b2-365081ef4b7a"
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
      _sellerID: "bae-e467e3b8-9ba5-52b4-ae6b-4499f2f0c483"
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
      _sellerID: "bae-e467e3b8-9ba5-52b4-ae6b-4499f2f0c483"
    }) {
      _docID
      title
    }
  }
  ```
</details>

## Use variables

Variables are identified by the dollar sign `$`.
The path to using them has three steps:

- Replace the value with the variable name (ex. `$bookID`)
- Provide the variable and its type in the query constructor (ex. `query ($title: String)`)
- Provide the variable value in a separate JSON object

```graphql title="Query a document by ID"
query ($bookID: [ID!]) {
  Book(docID: $bookID) {
    _docID
    title
    plot
    author { name }
  }
}
```
```json title="Variables"
{
  "bookID": "bae-c26135f1-59d6-5f32-a7c0-16dbec525abe"
}
```
```json title="Result"
{
  "data": {
    "Book": [
      {
        "_docID": "bae-c26135f1-59d6-5f32-a7c0-16dbec525abe",
        "author": {
          "name": "David Foster Wallace"
        },
        "plot": "A gargantuan, mind-altering tragi-comedy about the Pursuit of Happiness in America.",
        "title": "Infinite Jest"
      }
    ]
  }
}

```

```graphql title="Query a document with filters"
query ($plot: String, $minRating: Float64) {
  Book(filter: {
    plot: { _like: $plot }, rating: { _geq: $minRating }
  }) {
    title
    plot
    author { name }
    rating
  }
}
```
```json title="Variables"
{
  "plot": "%love%",
  "minRating": 3.8
}
```
```json title="Result"
{
  "data": {
    "Book": [
      {
        "author": {
          "name": "Victor Hugo"
        },
        "plot": "Victor Hugo's tale of injustice, heroism and love follows the fortunes of Jean Valjean, an escaped convict determined to put his criminal past behind him.",
        "rating": 4.21,
        "title": "Les Misérables"
      }
    ]
  }
}
```

## Optional and mandatory variables

By default, it is optional to provide a value to a variable for a given query. No value (i.e. `null`) is an allowed value. For example, omitting the value for `bookID` is valid, and results in all books being returned:

```graphql title="Query with optional variables"
query ($plot: String, $minRating: Float64) {
  Book(filter: {
    plot: { _like: $plot }, rating: { _geq: $minRating }
  }) {
    title
    plot
    rating
  }
}
```
```json title="Variables (no value for plot)"
{
  "minRating": 4.2
}
```
```json title="Result"
{
  "data": {
    "Book": [
      {
        "plot": "A masterpiece of rebellion and imprisonment where war is peace, freedom is slavery, and Big Brother is watching.",
        "rating": 4.2,
        "title": "1984"
      },
      {
        "plot": "Victor Hugo's tale of injustice, heroism and love follows the fortunes of Jean Valjean, an escaped convict determined to put his criminal past behind him.",
        "rating": 4.21,
        "title": "Les Misérables"
      },
      {
        "plot": "A gargantuan, mind-altering tragi-comedy about the Pursuit of Happiness in America.",
        "rating": 4.25,
        "title": "Infinite Jest"
      }
    ]
  }
}
```

You can make it mandatory to provide a value to a variable by appending an exclamation mark `!` to the type in the query constructor.

```graphql title="Query with mandatory $title variable"
# highlight-next-line
query ($title: String!, $minRating: Float64) {
  Book(filter: {
    title: { _like: $title }, rating: { _geq: $minRating }
  }) {
    title
    rating
  }
}
```
{ /*
```json title="Variables"
{
  "title": "%Infinite%",
  "minRating": 3.8
}
```
*/ }

## Default values

You can set a default value for a variable in its declaration:

```graphql title="Query with default value for $title variable"
# highlight-next-line
query ($title: String = "%%", $minRating: Float64) {
  Book(filter: {
    title: { _like: $title }, rating: { _geq: $minRating }
  }) {
    title
    rating
  }
}
```
