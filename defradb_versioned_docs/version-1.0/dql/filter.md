---
title: Filter documents
description: The filter object allow you to specify criteria for selecting documents. Filter on single fields, a combination of fields, relationship sub-objects.
---

It's fantastic to be able to store thousands of documents, but all this would be a silly business if you couldn't filter through them, wouldn't it?
The `filter` object allow you to specify criteria for selecting documents. You can filter on:
- [Single fields](#fields-single)
- [A combination of fields](#fields-multiple)
- [Relationship sub-objects](#rel-sub-objects)

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

## Single fields  {/* #fields-single */}

To filter on a single field, use the syntax `fieldName: { operator: Value }`, where:
- `fieldName` &ndash; Name of the collection field to compare against.
- `operator` &ndash; [Comparison operator](#scalar-operators) to use.
- `Value` &ndash; Value to compare against, of the same type of `fieldName`.

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
```json result
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

```graphql title='It is all about love, is it not? &ndash; Return books containing "love" in their plot (flexible matching)'
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
```json result
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

You need to explicitly specify the `_and` operator in case of two filters on the same field, because JSON objects cannot contain duplicate fields:

```graphql title="Valid &ndash; Multiple filters on same field with explicit operator" test-skip valid
filter: {
  _and: [
    { rating: { _gte: 4 } },
    { rating: { _lte: 5 } }
  ]
}
```
```graphql title="Invalid &ndash; Multiple filters on same field without operator" test-skip invalid
filter: {
  rating: { _gte: 4 },
  rating: { _lte: 5 }
}
```

## Multiple fields  {/* #fields-multiple */}

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
```json result
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

- `operator` &ndash; [Comparison operator](#scalar-operators) to use.
- `fieldName` &ndash; Name of the collection field to compare against.
- `Value` &ndash; Value to compare against, of the same type of `fieldName`.

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
```json result
{
  "data": {
    "Book": [
      {
        "genre": "Fiction",
        "rating": 4.2,
        "title": "1984"
      },
      {
        "genre": "Memoir",
        "rating": 4.09,
        "title": "Down and Out in Paris and London"
      },
      {
        "genre": "Fiction",
        "rating": 3.7,
        "title": "Lord of the Flies"
      },
      {
        "genre": "Fiction",
        "rating": 4.25,
        "title": "Infinite Jest"
      },
      {
        "genre": "Nonfiction",
        "rating": 4.18,
        "title": "Consider the Lobster and Other Essays"
      },
      {
        "genre": "Fiction",
        "rating": 3.85,
        "title": "Girl with Curious Hair"
      },
      {
        "genre": "Fiction",
        "rating": 4.21,
        "title": "Les Misérables"
      }
    ]
  }
}
```

:::note
The boolean operators `_and` and `_or` accept an array, whereas `_not` accepts an object.

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
```json result
{
  "data": {
    "Book": [
      {
        "genre": "Memoir",
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

## Relationship fields  {/* #rel-sub-objects */}

Filters can access fields within sub-objects, such as in relationships.
The syntax to filter over sub-objects has one more level of nesting in field names: `relFieldName: { fieldName: { operator: Value } }`, where:

- `relFieldName`, `fieldName` &ndash; Name of the collection field to compare against.
- `operator` &ndash; [Comparison operator](#scalar-operators) to use.
- `Value` &ndash; Value to compare against, of the same type of `fieldName`.


```graphql title="Filter books by genre and author's name"
{
  Book(filter: { 
    genre: { _eq: "Fiction" },
    # highlight-next-line
    author: { name: { _eq: "George Orwell" } }
  }) {
    title
    plot
  }
}
```
```json result
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

### One-to-many relationships {/* #rels-one-to-many */}

When filtering over one-to-many relationships from the _many_ side, a document is returned if _at least one_ of the linked documents fulfills the conditions: not all documents need to match the conditions.

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
```json result
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

If the return fields include the sub-object you filter on, the same filter is **not** applied to the result unless otherwise specified. For example, when filtering over people who have authored `Fiction` books, the returned books will include books of any genre:

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
```json result
{
  "data": {
    "Person": [
      {
        "authoredBooks": [
          {
            "genre": "Fiction",
            "title": "1984"
          },
          {
            "genre": "Memoir",
            "title": "Down and Out in Paris and London"
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
            "genre": "Fiction",
            "title": "Infinite Jest"
          },
          {
            "genre": "Nonfiction",
            "title": "Consider the Lobster and Other Essays"
          },
          {
            "genre": "Fiction",
            "title": "Girl with Curious Hair"
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
When specified explicitly, root-level and sub-objects filters are evaluated independently: the root filter is applied first and the sub-object filter is applied on the given field, per each returned document.

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
```json result
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

## JSON fields {/* #json-fields */}

If a `JSON` field is [indexed](schema/indexes.md), queries can traverse the JSON structure and filter by its inner properties. Inner properties support all [operators](#scalar-operators-by-type) of the related type (a string property supports all string operators, etc).

For example, the following setup allows to filter on `i.love`:

```graphql title='Schema for "jsonBlob" collection' test-setup-collection
type jsonBlob {
  jsonField: JSON @index
}
```
```graphql title="Create a document with a JSON property"
mutation {
  add_jsonBlob(input: {
    jsonField: {
      i: {
        love: "eating my family and commas"
      }
    }
  }) { jsonField }
}
```
```graphql title="Filter for JSON's inner properties"
{
  jsonBlob(filter: {
    jsonField: {
      i: {
        love: { _like: "%family%" }
      }
    }
  }) { jsonField }
}
```
```json result
{
  "data": {
    "jsonBlob": [
      {
        "jsonField": {
          "i": {
            "love": "eating my family and commas"
          }
        }
      }
    ]
  }
}
```

:::important
It is possible to _filter_ for a JSON field's inner properties, but it's not possible to return them.

```graphql title="Invalid &ndash; Return JSON field inner properties" test-error invalid
{
  jsonBlob {
    jsonField {
      i {
        love
      }
    }
  {
}
```
:::

## Renamed fields (aliases) {/* #field-aliases */}

You can filter over [renamed fields](aliases.md) via the `_alias` key. Alias names cannot be used directly in the `filter` object.

```graphql title="Valid &ndash; Filter a renamed field with _alias" valid
{
  Book(filter: { _alias: { bookTitle: { _eq: "1984" }}}) {
    bookTitle: title
  }
}
```

```graphql title="Invalid &ndash; Filter a renamed field directly" test-error invalid
{
  Book(filter: { bookTitle: { _eq: "1984" }}) {
    bookTitle: title
  }
}
```

## List fields {/* #field-list */}

The [list operators](#list-operators) `_any`, `_none`, `_all` evaluate a scalar operator on the elements of a list or JSON field and return a boolean. For example, `_any: { _lt: 3.5 }` evaluates to `true` if all the elements of the list are lower than `3.5`. List operators yield `false` on empty lists, `null` values, or non-list fields.

```graphql title="Return books having only ratings of at least 3.9"
{
  Book(filter: {
    ratings: { _all: { _geq: 3.9 } }
  }) {
    title
    ratings
  }
}
```
```json result
{
  "data": {
    "Book": [
      {
        "ratings": [
          3.9,
          4.1
        ],
        "title": "Les Misérables"
      }
    ]
  }
}
```

```graphql title="Return books having at least one rating lower than 3.5"
{
  Book(filter: {
    ratings: { _any: { _lt: 3.5 } }
  }) {
    title
    ratings
  }
}
```
```json result
{
  "data": {
    "Book": [
      {
        "ratings": [
          3.8,
          4.91,
          3.1,
          2.8
        ],
        "title": "1984"
      },
      {
        "ratings": [
          3.1,
          4.1,
          4.5
        ],
        "title": "Infinite Jest"
      }
    ]
  }
}
```

```graphql title="Return books having not even one rating lower than 3.0"
{
  Book(filter: {
    ratings: { _none: { _lt: 3.0 } }
  }) {
    title
    ratings
  }
}
```
```json result
{
  "data": {
    "Book": [
      {
        "ratings": [
          3.1,
          4.1,
          4.5
        ],
        "title": "Infinite Jest"
      },
      {
        "ratings": [
          3.9,
          4.1
        ],
        "title": "Les Misérables"
      }
    ]
  }
}
```

## Operators and types  {/* #operators-types */}

### Scalar operators  {/* #scalar-operators */}

| Operator   | Description |
| ---------- | ----------- |
| `_eq`      | Equal to |
| `_neq`     | Not Equal to |
| `_gt`      | Greater Than |
| `_geq`     | Greater or Equal to |
| `_lt`      | Less Than |
| `_leq`     | Less or Equal to |
| `_in`      | In list |
| `_nin`     | Not In list |
| `_like`    | Like sub-string (supports `%` wildcard) |
| `_ilike`   | Case-Insensitive Like sub-string (supports `%` wildcard) |
| `_nlike`   | Not like sub-string (supports `%` wildcard) |
| `_nilike`  | Not like case-Insensitive sub-string (supports `%` wildcard) |

### List operators  {/* #list-operators */}

| Operator   | Description |
| ---------- | ----------- |
| `_any`      | `true` if at least one element is `true` |
| `_none`     | `true` if none of the elements are `true` |
| `_all`      | `true` if all of the elements are `true` |

### Operators supported by type  {/* #scalar-operators-by-type */}

| Scalar Type | Operators |
| -------- | -------- |
| String, Blob | `_eq, _neq, _like, _ilike, _nlike, _nilike, _in, _nin` |
| Int, Float | `_eq, _neq, _gt, _geq, _lt, _leq, _in, _nin` |
| Boolean, ID | `_eq, _neq, _in, _nin` |
| DateTime | `_eq, _neq, _gt, _geq, _lt, _leq, _in, _nin` |
| JSON | Each inner field supports all operators supported by that type |
| List | `_any, _all, _none, _eq, _neq` |
