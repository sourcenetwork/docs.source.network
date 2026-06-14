---
title: Update existing documents
---

The only constant is change: so shall it be. Even if the [*history*](/commits.md) of data in DefraDB is permanent, you can still alter stored documents. Similarly to the `add_TYPE` mutation to [create documents](mutation-create.md), you update documents via the `update_TYPE` mutation. The mutation returns the updated documents.

```graphql title="Syntax for update mutation" test-skip
mutation {
  update_TYPE(docID: [ID], filter: filterObj, input: updateInput) [TYPE]
}
```

- `docID` &ndash; DocID of the document(s) to update. Either a string or a list of strings.
- `filter` &ndash; Criteria for selecting documents to update (see [Filter documents](filter.md)).
- `input` &ndash; JSON-like object containing the updates, same format as for [creating documents](mutation-create.md).

If both `filter` and `docID` are given, both criteria must be fulfilled for a document to be selected.

:::tip
To remove a field from a document, set its value to `null`.
:::

## Examples  { /* #examples */ }

<details>
  <summary>Display database setup</summary>
  
  This page assumes your database contains `Book` and `Person` [collections](/schema/collections.md) and some documents in them:

  ```graphql title="Database schema" test-setup-collection
  type Person {
    name: String
    authoredBooks: [Book]
  }

  type Book {
    title: String
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
      genre: "Fiction",
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
      genre: "Fiction",
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
```json title="Result"
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
```json title="Result"
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
    docID: ["bae-49bbd74a-64a5-5d84-83bd-08319b2e413b", "bae-1515e526-1107-54fb-b582-60b3f967c3b1"],
    input: { genre: "Dystopia" }
  ) {
    genre
    title
  }
}
```
```json title="Result"
{
  "data": {
    "update_Book": [
      {
        "genre": "Dystopia",
        "title": "Lord of the Flies"
      },
      {
        "genre": "Dystopia",
        "title": "1984"
      }
    ]
  }
}
```
