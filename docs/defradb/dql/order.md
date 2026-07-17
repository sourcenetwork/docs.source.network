---
title: Order results
description: The order object allows you to specify an ordering for the documents returned by a DQL query.
---

The `order` object allows you to specify an ordering for documents returned by a query.

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

## Order by a single field {/* #single */}

To order results, use the syntax `order: { fieldName: DIRECTION }`, where:
- `fieldName` &ndash; The name of the collection field to order by.
- `DIRECTION` &ndash; The direction of order: either `ASC` or `DESC`.

```graphql title="Order books by title, A-Z"
{
  # highlight-next-line
  Book(order: { title: ASC }) {
    title
  }
}
```
```json title="Result" result
{
  "data": {
    "Book": [
      {
        "title": "1984"
      },
      {
        "title": "Consider the Lobster and Other Essays"
      },
      {
        "title": "Down and Out in Paris and London"
      },
      {
        "title": "Girl with Curious Hair"
      },
      {
        "title": "Infinite Jest"
      },
      {
        "title": "Les Misérables"
      },
      {
        "title": "Lord of the Flies"
      }
    ]
  }
}
```

## Order by multiple fields &ndash; Resolve ties {/* #multiple-fields */}

You can specify a field for secondary order by providing a list of objects to the `order` parameter. The secondary order is used to resolve ties on the first field: cases in which multiple documents have the same value for the first ordering field.

```graphql title="Sort books on genre first, and then on title"
{
  Book(order: [{ genre: ASC }, { title: ASC }], limit: 4) {
    title
    genre
  }
}
```
```json title="Result" result
{
  "data": {
    "Book": [
      {
        "genre": "Fiction",
        "title": "1984"
      },
      {
        "genre": "Fiction",
        "title": "Girl with Curious Hair"
      },
      {
        "genre": "Fiction",
        "title": "Infinite Jest"
      },
      {
        "genre": "Fiction",
        "title": "Les Misérables"
      }
    ]
  }
}
```

There's no limit on the number of ordering fields that can be specified. Their priority is defined by the order in which they are given in the `order` object.

## Order by array sub-objects {/* #array-sub-objects */}

Ordering by sub-objects from the root object is only allowed if the sub-object is not an array. If it is an array (such as the *many* side of one-to-many relationships), the order must be applied to the object field in the selection set.

```graphql title="Valid &ndash; Order by relationship sub-object in the selection level" valid
{
  Person(order: { name: DESC }) {
    name
    # highlight-next-line
    authoredBooks(order: { title: ASC }) {
      title
    }
  }
}
```

```graphql title="Invalid &ndash; Order by relationship sub-object at root level" test-error invalid
{
  # highlight-next-line
  Person(order: [{ name: DESC }, { authoredBooks: { title: ASC } }]) {
    name
    authoredBooks {
      title
    }
  }
}
```
