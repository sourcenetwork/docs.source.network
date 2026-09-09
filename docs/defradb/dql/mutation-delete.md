---
title: Delete documents
description: How to use the delete_<type> and truncate_<TYPE> GraphQL mutations to delete documents in DefraDB.
---

Because the history of documents is append-only, **deletion in DefraDB works differently** than in most other databases. There's two ways of deleting a document:

1. **[Soft-delete](#soft-delete)** &ndash; The deletion is registered as another record in the document history. Queries won't return deleted documents, unless the query explicitly requests them. The details of deleted documents are still available, but queries ignore their existence when retrieving results.
2. **[Truncate](#truncate)** &ndash; Permanently delete a document, including its history.

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
      genre: "Dystopia",
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
      genre: "Dystopia",
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

## Soft-delete (`delete_TYPE` mutation) {/* #soft-delete */}

### Syntax  {/* #syntax */}

Similarly to the `update_TYPE` mutation to [update documents](mutation-update.md), you delete documents via the `delete_TYPE` mutation. The mutation returns the deleted documents.

```graphql title="Syntax &ndash; Delete mutation" test-skip
mutation {
  delete_TYPE(docID: [ID], filter: filterObj)
}
```
- `TYPE` &ndash; Name of the [collection](schema/collections.md) the documents belong to.
- `docID` &ndash; DocID of the document(s) to delete. Either a string or a list of strings.
- `filter` &ndash; Criteria for selecting documents to delete (see [Filter documents](filter.md)).

If both `filter` and `docID` are given, both criteria must be fulfilled for a document to be selected.

:::note
You cannot restore a deleted document, nor re-create a document with the exact same content as a previously deleted one, because the `docID` would conflict. In case you need to re-create a deleted document, create a new document with only _some_ of the fields of the deleted document, and then update it to include all the wished information.
:::

### Examples  { /* #examples */ }

```graphql title="Eliminate the dystopians"
mutation {
  delete_Person(
    filter: { authoredBooks: { genre: { _eq: "Dystopia" } } } 
  ) {
    name
  }
}
```
```json result
{
  "data": {
    "delete_Person": [
      {
        "name": "George Orwell"
      },
      {
        "name": "William Golding"
      }
    ]
  }
}
```

It looks like *power* has eliminated the dystopians, as a regular query does not return them as existing people.

```graphql title="The dystopians are gone"
{
  Person(filter: { authoredBooks: { genre: { _eq: "Dystopia"} } } ) {
    name
  }
}
```
```json result
{
  "data": {
    "Person": []
  }
}
```

True dystopians are however never erased. Deleted documents show up if the query requests to include them with `showDeleted: true`. The `_deleted` return field marks whether a document is deleted.

```graphql title="The dystopians are gone"
{
  Person(
    filter: { authoredBooks: { genre: { _eq: "Dystopia"} } },
    # highlight-next-line
    showDeleted: true
  ) {
    # highlight-next-line
    _deleted
    name
  }
}
```
```json result
{
  "data": {
    "Person": [
      {
        // highlight-next-line
        "_deleted": true,
        "name": "George Orwell"
      },
      {
        // highlight-next-line
        "_deleted": true,
        "name": "William Golding"
      }
    ]
  }
}
```

## Permanently delete (`truncate_TYPE` mutation) {/* #truncate */}

### Syntax

```graphql title="Syntax &ndash; Truncate mutation" test-skip
mutation {
  truncate_TYPE(filter: filterObj)
}
```
- `TYPE` &ndash; Name of the [collection](schema/collections.md) the documents belong to.
- `filter` &ndash; Criteria for selecting documents to delete (see [Filter documents](filter.md)). If filter is an empty object, **all documents are truncated**.

:::note
Only history blocks that are linked to the selected document are deleted. Blocks shared with other documents are preserved.
:::

:::important
Document truncation is a local operation and doesn't propagate to other nodes via [P2P](p2p/index.md).
:::

### Examples

#### Truncate some documents

```graphql title="Effectively eliminate the dystopians"
mutation {
  truncate_Person(
    filter: { authoredBooks: { genre: { _eq: "Dystopia" } } }
  )
}
```
```json result
{
  "data": {
    "truncate_Person": true
  }
}
```

Dystopians got fully erased, and they don't show up even if the query includes `showDeleted: true`.

```graphql title="The dystopians are gone"
{
  Person(
    filter: { authoredBooks: { genre: { _eq: "Dystopia"} } },
    showDeleted: true
  ) {
    name
  }
}
```
```json result
{
  "data": {
    "Person": []
  }
}
```

#### Truncate all documents

If the filter is empty, all documents are truncated. This is equivalent to [truncating the collection](schema/collections.md#truncate).

```graphql
mutation {
  truncate_Person(
    # highlight-next-line
    filter: {}
  )
}
```
```json result
{
  "data": {
    "truncate_Person": true
  }
}
```