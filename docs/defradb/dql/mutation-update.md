---
title: Update existing documents
description: How to use the update_<type> GraphQL mutation to update documents in DefraDB.
---

The only constant is change. Even if the [*history*](/time-travel.md) of data in DefraDB is permanent, you can still alter stored documents.

## Syntax  {/* #syntax */}

Similarly to the `add_TYPE` mutation to [create documents](mutation-create.md), you update documents via the `update_TYPE` mutation. The mutation returns the updated documents.

```graphql title="Syntax &ndash; Update mutation" test-skip
mutation {
  update_TYPE(docID: [ID], filter: filterObj, input: updateObj)
}
```
- `TYPE` &ndash; Name of the [collection](schema/collections.md) to query.
- `docID` &ndash; DocID of the document(s) to update. Either a string or a list of strings.
- `filter` &ndash; Criteria for selecting documents to update (see [Filter documents](filter.md)).
- `updateObj` &ndash; JSON-like object containing the updates, same format as for [creating documents](mutation-create.md).

If both `filter` and `docID` are given, both criteria must be fulfilled for a document to be selected.

:::tip
To remove a field from a document, set its value to `null`.
:::

## Examples  { /* #examples */ }

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

```graphql title="Update 1984's genre"
mutation {
  update_Book(
    filter: { title: { _eq: "1984" } },
    input: { genre: "Dystopia" }
  ) {
    genre
    title
  }
}
```
```json result
{
  "data": {
    "update_Book": [
      {
        "genre": "Dystopia",
        "title": "1984"
      }
    ]
  }
}
```

```graphql title="Remove genre value if not in list of allowed ones"
mutation {
  update_Book(
    filter: { genre: { _nin: ["Fiction", "Dystopia"] } },
    input: { genre: null }
  ) {
    title
  }
}
```
```json result
{
  "data": {
    "update_Book": [
      {
        "title": "Down and Out in Paris and London"
      },
      {
        "title": "Consider the Lobster and Other Essays"
      }
    ]
  }
}
```

```graphql title="Update genre for several books via their docIDs"
mutation {
  update_Book(
    docID: ["bae-97eeb5cb-04cf-5575-ab00-3e3285ce79b5", "bae-7da5622a-8e4f-5ac8-9140-d412a81011be"],
    input: { genre: "Dystopia" }
  ) {
    genre
    title
  }
}
```
```json result
{
  "data": {
    "update_Book": [
      {
        "genre": "Dystopia",
        "title": "1984"
      },
      {
        "genre": "Dystopia",
        "title": "Lord of the Flies"
      }
    ]
  }
}
```
