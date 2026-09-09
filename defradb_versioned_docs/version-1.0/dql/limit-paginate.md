---
title: Limit and paginate results
description: The `limit` and `offset` keywords allow you to control how many records a query will return.
---

There's no limit on the amount of data you can store in DefraDB, and thus there's no limit on how many results DefraDB will return when querying it. Don't overwhelm yourself.
The `limit` and `offset` keywords allow you to control how many records a query will return. You can combine them to create a pagination system.

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


## Limit results (`limit`) {/* #limit */}

With the `limit` keyword you can specify the maximum number of records to return from a query's result set.

```graphql title="Get the 3 top-rated books"
{
  # highlight-next-line
  Book(order: { rating: DESC }, limit: 3) {
    title
    plot
    rating
  }
}
```
```json result
{
  "data": {
    "Book": [
      {
        "plot": "A gargantuan, mind-altering tragi-comedy about the Pursuit of Happiness in America.",
        "rating": 4.25,
        "title": "Infinite Jest"
      },
      {
        "plot": "Victor Hugo's tale of injustice, heroism and love follows the fortunes of Jean Valjean, an escaped convict determined to put his criminal past behind him.",
        "rating": 4.21,
        "title": "Les Misérables"
      },
      {
        "plot": "A masterpiece of rebellion and imprisonment where war is peace, freedom is slavery, and Big Brother is watching.",
        "rating": 4.2,
        "title": "1984"
      }
    ]
  }
}
```

## Skip results (`offset`) {/* #offset */}

With the `offset` keyword you can specify how many records to be skipped in the result set. The database will return records after the given `offset` number.

```graphql title="Get the 3 top-rated books after the first 2"
{
  # highlight-next-line
  Book(order: { rating: DESC }, limit: 3, offset: 2) {
    title
    plot
    rating
  }
}
```
```json result
{
  "data": {
    "Book": [
      {
        "plot": "A masterpiece of rebellion and imprisonment where war is peace, freedom is slavery, and Big Brother is watching.",
        "rating": 4.2,
        "title": "1984"
      },
      {
        "plot": "Do lobsters feel pain? Did Franz Kafka have a funny bone? What is John Updike's deal, anyway? And what happens when adult video starlets meet their fans in person? Essays that are also enthralling narrative adventures.",
        "rating": 4.18,
        "title": "Consider the Lobster and Other Essays"
      },
      {
        "plot": "The adventures of a penniless British writer among the down-and-outs of two great cities.",
        "rating": 4.09,
        "title": "Down and Out in Paris and London"
      }
    ]
  }
}
```
