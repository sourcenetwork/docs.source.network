---
title: Sort and order results
---

By default, results are sorted by [`_docID`](/dql/mutation-create.md#docid).
The `order` object allows you to specify a different sorting for documents returned by a query.

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

## Sorting results

To order results, use the syntax `order: { fieldName: DIRECTION }`, where:
- `fieldName` &ndash; The name of the collection field to order by.
- `DIRECTION` &ndash; The direction of order: either `ASC` or `DESC`.

```graphql title="Sort books by title, A-Z"
{
  # highlight-next-line
  Book(order: { title: ASC }) {
    title
  }
}
```
```json title="Result"
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

## Resolving ties &ndash; Sorting multiple fields

If multiple documents have the same value for the field used for ordering, by default the secondary ordering is on the `_docID`. In other words, ties are resolved with the unique document IDs.

```graphql title="Default secondary ordering: books with same genre are sorted by _docID"
{
  Book(order: { genre: ASC }, limit: 4) {
    _docID
    title
    genre
  }
}
```
```json title="Result"
{
  "data": {
    "Book": [
      {
        "_docID": "bae-32df1584-35fc-5a12-b1e5-e8b00f4b9a48",
        "genre": "Biography",
        "title": "Down and Out in Paris and London"
      },
      {
        // highlight-next-line
        "_docID": "bae-1515e526-1107-54fb-b582-60b3f967c3b1",
        "genre": "Fiction",
        "title": "Lord of the Flies"
      },
      {
        // highlight-next-line
        "_docID": "bae-49bbd74a-64a5-5d84-83bd-08319b2e413b",
        "genre": "Fiction",
        "title": "1984"
      },
      {
        // highlight-next-line
        "_docID": "bae-99a36f4d-54c6-5d54-8b9d-cceab63aa86f",
        "genre": "Fiction",
        "title": "Les Misérables"
      }
    ]
  }
}
```

You can specify a different field for secondary order by providing a list to the `order` object. The ordering on the second field is used to resolve ties on the first field.

```graphql title="Sort books on genre first, and then on title"
{
  Book(order: [{ genre: ASC }, { title: ASC }], limit: 4) {
    _docID
    title
    genre
  }
}
```
```json title="Result"
{
  "data": {
    "Book": [
      {
        "_docID": "bae-32df1584-35fc-5a12-b1e5-e8b00f4b9a48",
        "genre": "Biography",
        "title": "Down and Out in Paris and London"
      },
      {
        "_docID": "bae-49bbd74a-64a5-5d84-83bd-08319b2e413b",
        "genre": "Fiction",
        // highlight-next-line
        "title": "1984"
      },
      {
        "_docID": "bae-c098a085-0f2c-5460-8bb9-a15d2861e7ac",
        "genre": "Fiction",
        // highlight-next-line
        "title": "Infinite Jest"
      },
      {
        "_docID": "bae-99a36f4d-54c6-5d54-8b9d-cceab63aa86f",
        "genre": "Fiction",
        // highlight-next-line
        "title": "Les Misérables"
      }
    ]
  }
}
```

There's no limit on the number of ordering fields that can be specified. Their priority is defined by the order in which they are given in the `order` object.

:::note
Regardless of the number of fields in the `order` object, `_docID` is always used to solve ties on the latest level.
:::

## Sorting for array sub-objects

Sorting on sub-objects from the root object is only allowed if the sub-object is not an array. If it is an array (such as the *many* side of one-to-many relationships), the sort must be applied to the object field in the selection set.

```graphql title="Valid &ndash; Sorting for relationship sub-object in the selection level"
# valid
{
  Person(order: { name: DESC }) {
    name
    authoredBooks(order: { title: ASC }) {
      title
    }
  }
}
```

```graphql title="Invalid &ndash; Sorting for relationship sub-object at root level" test-error
# invalid
{
  Person(order: [{ name: DESC }, { authoredBooks: { title: ASC } }]) {
    name
    authoredBooks {
      title
    }
  }
}
```
