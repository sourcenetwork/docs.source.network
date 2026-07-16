---
title: Rename result fields (aliases)
description: Aliases allow you to rename fields and entire query results with identifiers of your choice.
---

Sometimes, _Little Bobby Tables_ is the right name. Other times, you might want to change the default names that the database returns in results. Aliases allow you to rename fields and entire query results with identifiers of your choice.

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

## Rename queries {/* #queries */}

To rename the return key for a query, prefix the custom name to the query and separate the two with a colon `:`.

```graphql title='Return the three top-rated books under the key "topThreeBooks"'
{
  # highlight-next-line
  topThreeBooks: Book(order: { rating: DESC }, limit: 3) {
    title
    plot
    rating
  }
}
```
```json title="Result" result
{
  "data": {
    // highlight-next-line
    "topThreeBooks": [
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

You must alias queries when one request contains multiple queries to the same type.

```graphql title='Two queries on type Book return results under "topThreeBooks" and "worstThreeBooks"'
{
  # highlight-next-line
  topThreeBooks: Book(order: { rating: DESC }, limit: 3) {
    title
    genre
    plot
  }
  # highlight-next-line
  worstThreeBooks: Book(order: { rating: ASC }, limit: 3) {
    title
    genre
    plot
  }
}
```
```json title="Result" result
{
  "data": {
    // highlight-next-line
    "topThreeBooks": [
      {
        "genre": "Fiction",
        "plot": "A gargantuan, mind-altering tragi-comedy about the Pursuit of Happiness in America.",
        "title": "Infinite Jest"
      },
      {
        "genre": "Fiction",
        "plot": "Victor Hugo's tale of injustice, heroism and love follows the fortunes of Jean Valjean, an escaped convict determined to put his criminal past behind him.",
        "title": "Les Misérables"
      },
      {
        "genre": "Fiction",
        "plot": "A masterpiece of rebellion and imprisonment where war is peace, freedom is slavery, and Big Brother is watching.",
        "title": "1984"
      }
    ],
    // highlight-next-line
    "worstThreeBooks": [
      {
        "genre": "Fiction",
        "plot": "At the dawn of the next world war, a plane crashes on an uncharted island, stranding a group of schoolboys.",
        "title": "Lord of the Flies"
      },
      {
        "genre": "Fiction",
        "plot": "Remarkable and unsettling reimaginations of reality.",
        "title": "Girl with Curious Hair"
      },
      {
        "genre": "Memoir",
        "plot": "The adventures of a penniless British writer among the down-and-outs of two great cities.",
        "title": "Down and Out in Paris and London"
      }
    ]
  }
}
```

## Rename fields {/* #fields */}

To rename the return key for a field, prefix the custom name to the field in the selection set and separate the two with a colon `:`.

```graphql title='Rename the field "plot" to "description"'
{
  Book(filter: { title: { _eq: "1984" } }) {
    title
    genre
    # highlight-next-line
    description: plot
  }
}
```
```json title="Result" result
{
  "data": {
    "Book": [
      {
        "description": "A masterpiece of rebellion and imprisonment where war is peace, freedom is slavery, and Big Brother is watching.",
        "genre": "Fiction",
        "title": "1984"
      }
    ]
  }
}
```

:::tip
Filters over renamed fields require the `_alias` key. See [Filter -> Field aliases](filter.md#field-aliases) for more information.
:::
