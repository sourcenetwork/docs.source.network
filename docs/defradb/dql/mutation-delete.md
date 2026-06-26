---
title: Delete documents
---

**Deletion in DefraDB works differently** than in most other databases. Because the history of documents is append-only, the deletion of a document is registered just as another record in the history. Queries don't return deleted documents though, unless [the query explicitly requests deleted documents](mutation-query.md#show-deleted). In other words: the details of a deleted document are still available, but queries ignore its existence when retrieving results. The only way to permanently delete a document is to [truncate the collection](/schema/collections.md#truncate) it belongs to.

## Syntax  {/* #syntax */}

Similarly to the `update_TYPE` mutation to [update documents](mutation-update.md), you delete documents via the `delete_TYPE` mutation. The mutation returns the deleted documents.

```graphql title="Syntax &ndash; Delete mutation" test-skip
mutation {
  delete_TYPE(docID: [ID], filter: filterObj)
}
```
- `TYPE` &ndash; Name of the [collection](schema/collections.md) to query.
- `docID` &ndash; DocID of the document(s) to delete. Either a string or a list of strings.
- `filter` &ndash; Criteria for selecting documents to delete (see [Filter documents](filter.md)).

If both `filter` and `docID` are given, both criteria must be fulfilled for a document to be selected.

:::note
You cannot restore a deleted document, nor re-create a document with the exact same content as a previously deleted one, because the `docID` would conflict. In case you need to re-create a deleted document, create a new document with only _some_ of the fields of the deleted document, and then update it to include all the wished information.
:::

## Examples  { /* #examples */ }

<details>
  <summary>Display database setup</summary>
  
  This page assumes your database contains `Book` and `Person` [collections](/schema/collections.md) and some documents in them:

  ```graphql title="Database schema" test-setup-collection
  type Person {
    name: String!
    authoredBooks: [Book]
  }

  type Book {
    title: String!
    genre: String
    plot: String
    rating: Float
    author: Person
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
      genre: "Dystopia",
      plot: "A masterpiece of rebellion and imprisonment where war is peace, freedom is slavery, and Big Brother is watching.",
      rating: 4.20,
      _authorID: "bae-3517d1eb-351b-5231-8387-870893ffb395"
    }) {
      _docID
      title
    }
    b12:add_Book(input: {
      title: "Down and Out in Paris and London",
      genre: "Biography",
      plot: "The adventures of a penniless British writer among the down-and-outs of two great cities.",
      rating: 4.09,
      _authorID: "bae-3517d1eb-351b-5231-8387-870893ffb395"
    }) {
      _docID
      title
    }
    b21:add_Book(input: {
      title: "Lord of the Flies",
      genre: "Dystopia",
      plot: "At the dawn of the next world war, a plane crashes on an uncharted island, stranding a group of schoolboys.",
      rating: 3.70,
      _authorID: "bae-78e9c7be-10b9-5673-bad2-da3341367d4b"
    }) {
      _docID
      title
    }
    b31:add_Book(input: {
      title: "Infinite Jest",
      genre: "Fiction",
      plot: "A gargantuan, mind-altering tragi-comedy about the Pursuit of Happiness in America.",
      rating: 4.25
      _authorID: "bae-b59928dc-fd05-5fb7-aea2-9b24af5ebcea"
    }) {
      _docID
      title
    }
    b32:add_Book(input: {
      title: "Consider the Lobster and Other Essays",
      genre: "Nonfiction",
      plot: "Do lobsters feel pain? Did Franz Kafka have a funny bone? What is John Updike's deal, anyway? And what happens when adult video starlets meet their fans in person? Essays that are also enthralling narrative adventures.",
      rating: 4.18,
      _authorID: "bae-b59928dc-fd05-5fb7-aea2-9b24af5ebcea"
    }) {
      _docID
      title
    }
    b41:add_Book(input: {
      title: "Les Misérables",
      genre: "Fiction",
      plot: "Victor Hugo's tale of injustice, heroism and love follows the fortunes of Jean Valjean, an escaped convict determined to put his criminal past behind him.",
      rating: 4.21,
      _authorID: "bae-c169e917-df52-5603-9224-39c1757f1b04"
    }) {
      _docID
      title
    }
  }
  ```
</details>

```graphql title="Eliminate the dystopians"
mutation {
  delete_Person(
    filter: { authoredBooks: { genre: { _eq: "Dystopia" } } } 
  ) {
    _docID
    name
  }
}
```
```json title="Result"
{
  "data": {
    "delete_Person": [
      {
        "_docID": "bae-3517d1eb-351b-5231-8387-870893ffb395",
        "name": "George Orwell"
      },
      {
        "_docID": "bae-78e9c7be-10b9-5673-bad2-da3341367d4b",
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
```json title="Result"
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
```json title="Result"
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
