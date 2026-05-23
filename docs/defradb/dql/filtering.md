---
title: Filter documents
---

Filters allow you to specify criterias for selecting documents. You provide them with an optional `filter` object. You can filter on the following:
- [Individual fields](#fields-individual)
- [A combination of fields](#fields-combined)
- [Relationship sub-objects](#rel-sub-objects)

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

## Individual fields  {/* #individual-fields */}

```graphql title='Return books with title "1984"'
{
  Book(filter: {
    # highlight-next-line
    title: { _eq: "1984" }
  }) {
    title
    genre
    plot
  }
}
```
```json title="Result"
{
  "data": {
    "Book": [
      {
        "genre": "Fiction",
        "plot": "A masterpiece of rebellion and imprisonment where war is peace, freedom is slavery, and Big Brother is watching.",
        "title": "1984"
      }
    ]
  }
}
```

```graphql title='It is all about love, is it not? &ndash; Return books containing "love" in their plot (flexible matching).'
{
  Book(filter: {
    # highlight-next-line
    plot: { _ilike: "%love%" }
  }) {
    title
    genre
    plot
  }
}
```
```json title="Result"
{
  "data": {
    "Book": [
      {
        "genre": "Fiction",
        "plot": "Victor Hugo's tale of injustice, heroism and love follows the fortunes of Jean Valjean, an escaped convict determined to put his criminal past behind him.",
        "title": "Les Misérables"
      }
    ]
  }
}
```

To filter on a single field, use the syntax `fieldName: { operator: Value }`, where:
- `fieldName` &ndash; The name of the collection field to compare against.
- `operator` &ndash; The [comparison operator](#operators) to use.
- `Value` &ndash; To value to compare against, of the same type of `fieldName`.

You need to explicitly specify the `_and` operator in case of two filters on the same field, because JSON objects cannot contain duplicate fields:

```graphql title="Valid &ndash; Multiple filters on same field with explicit operator" test-skip
filter: {
  _and: [
    { rating: { _gte: 4 } },
    { rating: { _lte: 5 } }
  ]
}
```
```graphql title="Invalid &ndash; Multiple filters on same field without operator" test-skip
filter: {
  rating: { _gte: 4 },
  rating: { _lte: 5 }
}
```

## Combine fields  {/* #fields-combined */}

Additional fields listed in the `filter` object are implicitly combined with an `AND` operator.

```graphql title='Return books with title "1984" and genre "Fiction"'
{
  Book(filter: {  # filters combined with AND by default
    # highlight-next-line
    title: { _eq: "1984" },
    # highlight-next-line
    genre: { _eq: "Fiction" }
  }) {
    title
    genre
    plot
  }
}
```
```json title="Result"
{
  "data": {
    "Book": [
      {
        "genre": "Fiction",
        "plot": "A masterpiece of rebellion and imprisonment where war is peace, freedom is slavery, and Big Brother is watching.",
        "title": "1984"
      }
    ]
  }
}
```

To use other operators and nested comparisons, use the syntax

```text
filter: {
  operator: [ { fieldName: Value }, ... ],
  ...
}
```

- `operator` &ndash; The [comparison operator](#operators) to use.
- `fieldName` &ndash; The name of the collection field to compare against.
- `Value` &ndash; To value to compare against, of the same type of `fieldName`.

```graphql title='Retrieve all books that either have genre == "Fiction", or rating between 4 and 5'
{
  Book(
    # highlight-start
    filter: {
      _or: [
	{ genre: { _eq: "Fiction" } },
	{ _and: [
	  { rating: { _geq: 4 } },
	  { rating: { _leq: 5 } },
	] },
      ]
    }
    # highlight-end
  ) {
    title
    genre
    rating
  }
}
```
```json title="Result"
{
  "data": {
    "Book": [
      {
        "genre": "Fiction",
        "rating": 3.7,
        "title": "Lord of the Flies"
      },
      {
        "genre": "Biography",
        "rating": 4.09,
        "title": "Down and Out in Paris and London"
      },
      {
        "genre": "Fiction",
        "rating": 4.2,
        "title": "1984"
      },
      {
        "genre": "Nonfiction",
        "rating": 4.18,
        "title": "Consider the Lobster and Other Essays"
      },
      {
        "genre": "Fiction",
        "rating": 4.21,
        "title": "Les Misérables"
      },
      {
        "genre": "Fiction",
        "rating": 4.25,
        "title": "Infinite Jest"
      }
    ]
  }
}
```

:::note
The conditional keywords `_and` and `_or` accept an array, whereas `_not` accepts an object.

```graphql title='Filter all objects that *do not* have the genre "Fiction"'
{
  Book(
    # highlight-next-line
    filter: { _not: { genre: { _eq: "Fiction" } } }
  ) {
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
        "genre": "Biography",
        "title": "Down and Out in Paris and London"
      },
      {
        "genre": "Nonfiction",
        "title": "Consider the Lobster and Other Essays"
      }
    ]
  }
}
```
:::


## Relationship sub-objects  {/* #rel-sub-objects */}

Filters can access fields within nested objects, such as in relationships:

```graphql title="Filter books by genre and author's name"
{
  Book(filter: { 
    genre: { _eq: "Fiction" }, 
    author: { name: { _eq: "George Orwell" } }
  }) {
    title
    plot
  }
}
```
```json title="Result"
{
  "data": {
    "Book": [
      {
        "plot": "A masterpiece of rebellion and imprisonment where war is peace, freedom is slavery, and Big Brother is watching.",
        "title": "1984"
      }
    ]
  }
}
```

The syntax to filter over sub-objects has one more level of nesting in field names: `relFieldName: { fieldName: { operator: Value } }`, where:

- `relFieldName`, `fieldName` &ndash; The name of the collection field to compare against.
- `operator` &ndash; The [comparison operator](#operators) to use.
- `Value` &ndash; To value to compare against, of the same type of `fieldName`.

### One-to-many relationships {/* #rels-one-to-many */}

When filtering over one-to-many relationships from the _many_ side, a document is returned if _at least one_ of the linked documents fulfills the conditions; not all documents need to match the conditions.

For example, when filtering over people that have authored books of genre `Fiction`, every person that has _at least one_ fiction book among their authored books will be returned:

```graphql
{
  Person(filter: {
    authoredBooks: { genre: { _eq: "Fiction" } }
  }) {
    name
  }
}
```
```json title="Result"
{
  "data": {
    "Person": [
      {
        "name": "George Orwell"
      },
      {
        "name": "William Golding"
      },
      {
        "name": "David Foster Wallace"
      },
      {
        "name": "Victor Hugo"
      }
    ]
  }
}
```

If the return fields include the sub-object you filter on, the same filter is not applied to the result unless otherwise specified. For example, when filtering over people who have authored `Fiction` books, the returned books will include books of any genre:

```graphql title="Get persons who have authored at least one fiction book; return their names and *all* their authored books"
{
  Person(filter: {
    authoredBooks: { genre: { _eq: "Fiction" } }
  }) {
    name
    authoredBooks {
      title
      genre
    }
  }
}
```
```json title="Result"
{
  "data": {
    "Person": [
      {
        "authoredBooks": [
          {
            "genre": "Biography",
            "title": "Down and Out in Paris and London"
          },
          {
            "genre": "Fiction",
            "title": "1984"
          }
        ],
        "name": "George Orwell"
      },
      {
        "authoredBooks": [
          {
            "genre": "Fiction",
            "title": "Lord of the Flies"
          }
        ],
        "name": "William Golding"
      },
      {
        "authoredBooks": [
          {
            "genre": "Nonfiction",
            "title": "Consider the Lobster and Other Essays"
          },
          {
            "genre": "Fiction",
            "title": "Infinite Jest"
          }
        ],
        "name": "David Foster Wallace"
      },
      {
        "authoredBooks": [
          {
            "genre": "Fiction",
            "title": "Les Misérables"
          }
        ],
        "name": "Victor Hugo"
      }
    ]
  }
}
```

You can override this behavior by specifying a different filter on the sub-object in the result fields.
When specified explicitly, root-level and sub-objects filters are evaluated indipendently: the root filter is applied first and the sub-object filter is applied on the given field, per each returned document.

```graphql title="Return all fiction books from George Orwell"
{
  Person(filter: { name: { _eq: "George Orwell" } }) {
    name
    authoredBooks(filter: { genre: { _eq: "Fiction" } } ) {
      title
      genre
    }
  }
}
```
```json title="Result"
{
  "data": {
    "Person": [
      {
        "authoredBooks": [
          {
            "genre": "Fiction",
            "title": "1984"
          }
        ],
        "name": "George Orwell"
      }
    ]
  }
}
```

## Operators and types  {/* #operators-types */}

### Supported operators  {/* #operators */}

| Operator   | Description |
| ---------- | ----------- |
| `_eq`      | Equal to        |
| `_neq`     | Not Equal to        |
| `_gt`      | Greater Than        |
| `_geq`     | Greater or Equal to        |
| `_lt`      | Less Than        |
| `_leq`     | Less or Equal to        |
| `_in`      | In List        |
| `_nin`     | Not In List        |
| `_like`    | Like Sub-String (supports `%` wildcard)        |
| `_ilike`   | Case-Insensitive Like Sub-String (supports `%` wildcard)        |
| `_nlike`   | Unlike Sub-String (supports `%` wildcard)      |
| `_nilike`  | Unlike Case-Insensitive Sub-String (supports `%` wildcard)      |

### Operators supported by scalar types  {/* #operators-by-type */}

| Scalar Type | Operators |
| -------- | -------- |
| String     | `_eq, _neq, _like, _ilike, _nlike, _nilike, _in, _nin`     |
| Integer     | `_eq, _neq, _gt, _geq, _lt, _leq, _in, _nin`     |
| Floating Point     | `_eq, _neq, _gt, _geq, _lt, _leq, _in, _nin`     |
| Boolean     | `_eq, _neq, _in, _nin`     |
| DateTime     | `_eq, _neq, _gt, _geq, _lt, _leq, _in, _nin`     |
