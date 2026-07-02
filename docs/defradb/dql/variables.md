---
title: Query variables
description: How and why to use variables in GraphQL queries in DefraDB.
---

For simplicity, most examples have hardcoded values in queries. Although that is fine for understanding and prototyping, it is **not** fine for production applications. For *oh god so many* reasons:

- Your application becomes vulnerable to GraphQL injections. Any user input you miss to sanitize is a hazard.
- Your application has to dynamically build each query with string interpolation.
- The database receives a bunch of different queries which are just different flavors of the same query, but can't cache them efficiently because of their apparent difference. 

The best practice is thus to use variables for all values that might change over different query runs. This is especially relevant when using [filters](filter.md).

<details>
  <summary>Display database setup</summary>
  
  To reproduce the example results from this page, your database needs the following setup.

  ```graphql title="Database schema" test-setup-collection
  type Book {
    title: String!
    genre: String
    plot: String
    rating: Float
    ratings: [Float]
    author: Person
    seller: Company
  }
  
  type Person {
    name: String!
    authoredBooks: [Book]
  }

  type Company {
    name: String!
    sells: [Book]
  }
  ```
  ```graphql title="Documents setup" test-setup-data
  mutation {
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

    c1:add_Company(input: {
      name: "The Independent Hipster Bookshop"
    }) { _docID name }
    c2:add_Company(input: {
      name: "The World-Destroying Large Chain"
    }) { _docID name }
  
    b11:add_Book(input: {
      title: "1984",
      genre: "Fiction",
      plot: "A masterpiece of rebellion and imprisonment where war is peace, freedom is slavery, and Big Brother is watching.",
      rating: 4.20,
      ratings: [3.8, 4.91, 3.1, 2.8],
      _authorID: "bae-bc532931-4843-50bc-bbdd-3e31549c8cc6",
      _sellerID: "bae-a5300933-fb0a-5b8f-b38e-202565993ff0"
    }) { _docID title }
    b12:add_Book(input: {
      title: "Down and Out in Paris and London",
      genre: "Memoir",
      plot: "The adventures of a penniless British writer among the down-and-outs of two great cities.",
      rating: 4.09,
      _authorID: "bae-bc532931-4843-50bc-bbdd-3e31549c8cc6",
      _sellerID: "bae-a5300933-fb0a-5b8f-b38e-202565993ff0"
    }) { _docID title }
    b21:add_Book(input: {
      title: "Lord of the Flies",
      genre: "Fiction",
      plot: "At the dawn of the next world war, a plane crashes on an uncharted island, stranding a group of schoolboys.",
      rating: 3.70,
      _authorID: "bae-6025af65-e57e-5db5-84dd-d349b130c6d9",
      _sellerID: "bae-a5300933-fb0a-5b8f-b38e-202565993ff0"
    }) { _docID title }
    b31:add_Book(input: {
      title: "Infinite Jest",
      genre: "Fiction",
      plot: "A gargantuan, mind-altering tragi-comedy about the Pursuit of Happiness in America.",
      rating: 4.25,
      ratings: [3.1, 4.1, 4.5],
      _authorID: "bae-26c791a7-fa81-5d86-95c5-4119e2fef915",
      _sellerID: "bae-81d5fadb-c2a3-5d95-b235-a220c220bf79"
    }) { _docID title }
    b32:add_Book(input: {
      title: "Consider the Lobster and Other Essays",
      genre: "Nonfiction",
      plot: "Do lobsters feel pain? Did Franz Kafka have a funny bone? What is John Updike's deal, anyway? And what happens when adult video starlets meet their fans in person? Essays that are also enthralling narrative adventures.",
      rating: 4.18,
      _authorID: "bae-26c791a7-fa81-5d86-95c5-4119e2fef915",
      _sellerID: "bae-81d5fadb-c2a3-5d95-b235-a220c220bf79"
    }) { _docID title }
    b33:add_Book(input: {
      title: "Girl with Curious Hair",
      genre: "Fiction",
      plot: "Remarkable and unsettling reimaginations of reality.",
      rating: 3.85,
      _authorID: "bae-26c791a7-fa81-5d86-95c5-4119e2fef915",
      _sellerID: "bae-81d5fadb-c2a3-5d95-b235-a220c220bf79"
    }) { _docID title }
    b41:add_Book(input: {
      title: "Les Misérables",
      genre: "Fiction",
      plot: "Victor Hugo's tale of injustice, heroism and love follows the fortunes of Jean Valjean, an escaped convict determined to put his criminal past behind him.",
      rating: 4.21,
      ratings: [3.9, 4.1],
      _authorID: "bae-4bfe5f4c-d668-5dc3-9de2-eb598af3da7d",
      _sellerID: "bae-81d5fadb-c2a3-5d95-b235-a220c220bf79"
    }) { _docID title }
  }
  ```
</details>

## Use variables {/* #use-variables */}

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
  "bookID": "bae-d1460b1a-8f78-5791-b0ec-869997260c20"
}
```
```json title="Result"
{
  "data": {
    "Book": [
      {
        "_docID": "bae-d1460b1a-8f78-5791-b0ec-869997260c20",
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

## Optional and mandatory variables {/* #optional-mandatory */}

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
        "plot": "A gargantuan, mind-altering tragi-comedy about the Pursuit of Happiness in America.",
        "rating": 4.25,
        "title": "Infinite Jest"
      },
      {
        "plot": "Victor Hugo's tale of injustice, heroism and love follows the fortunes of Jean Valjean, an escaped convict determined to put his criminal past behind him.",
        "rating": 4.21,
        "title": "Les Misérables"
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

## Default values {/* #default-values */}

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