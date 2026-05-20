---
title: Filter documents
---

Filters allow you to specify criterias for selecting documents. You provide them with an optional `filter` object. You can filter on the following:
- [Individual fields](#fields-individual)
- [A combination of fields](#fields-combined)
- [Relationship sub-objects](#rel-sub-objects)

<details>
  <summary>Display database setup</summary>
  
  This page assumes your database contains `Book` and `Person` [collections](/schema/collections.md):

  ```graphql title="Database schema"
  type Person {
    name: String
    authoredBooks: [Book]
  }

  type Book {
    title: String
    plot: String
    rating: Float
    author: Person
  }
  ```
</details>

## Individual fields  {/* #individual-fields */}

```graphql title='Return books with title "A Painted House"'
{
  Books(filter: {
    // highlight-next-line
    title: { _eq: "A Painted House" }
  }) {
    title
    genre
    description
  }
}
```

To filter on a single field, use the syntax `fieldName: { operator: Value }`, where:
- `fieldName` &ndash; The name of the collection field to compare against.
- `operator` &ndash; The [comparison operator](#operators) to use.
- `Value` &ndash; To value to compare against, of the same type of `fieldName`.

You need to explicitly specify the `_and` operator in case of two filters on the same field, because JSON objects cannot contain duplicate fields:

```graphql title="Invalid &ndash; Multiple filters on same field without operator"
filter: {
  rating: { _gte: 4 },
  rating: { _lte: 5 }
}
```

```graphql title="Valid &ndash; Multiple filters on same field with explicit operator"
filter: {
  _and: [
    { rating: { _gte: 4 } },
    { rating: { _lte: 5 } }
  ]
}
```

## Combine fields  {/* #fields-combined */}

Additional fields listed in the `filter` object are implicitly combined with an `AND` operator.

```graphql title='Return books with title "A Painted House" and genre "Thriller"'
{
  Books(filter: {  # filters combined with AND by default
    //highlight-next-line
    title: { _eq: "A Painted House" },
    //highlight-next-line
    genre: { _eq: "Thriller" }
  }) {
    title
    genre
    description
  }
}
```

To use other operators and nested comparisons, use the syntax

```json
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
  Books(
    //highlight-start
    filter: {
      _or: [
	{ genre: { _eq: "Fiction" } },
	{ _and: [
	  { rating: { _gte: 4 } },
	  { rating: { _lte: 5 } },
	] },
      ]
    }
    //highlight-end
  ) {
    title
    genre
    description
  }
}
```

:::note
The conditional keywords `_and` and `_or` accept an array, whereas `_not` accepts an object.

```graphql title='Filter all objects that *do not* have the genre "Fiction"'
{
  Books(
    //highlight-next-line
    filter: { _not: { genre: { _eq: "Fiction" } } }
  ) {
    title
    genre
    description
  }
}
```
:::


## Relationship sub-objects  {/* #rel-sub-objects */}

Filters can access fields within nested objects, such as in relationships:

```graphql title="Filter books by genre and author's name"
{
  Books(filter: { 
    genre: { _eq: "Fiction" }, 
    author: { name: { _eq: "George Orwell" } }
  }) {
    title
    plot
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

If the return fields include the sub-object you filter on, the same filter is implicitly applied to the result unless otherwise specified. For example, when filtering over people who have authored `Fiction` books, the returned books will also be of `genre == "Fiction"` only:

```graphql title="Get persons who have authored at least one fiction book; return their names and their fiction books *only*"
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

You can override this behavior by specifying a different filter on the sub-object in the result fields:

```graphql title="Get persons who have authored at least one fiction book; return their names and *all* their authored books"	
{
  Person(filter: {
    authoredBooks: { genre: { _eq: "Fiction" } }
  }) {
    name
    //highlight-next-line
    authoredBooks(filter: {}) {
      title
      genre
    }
  }
}
```

When specified explicitly, root-level and sub-objects filters are evaluated indipendently: the root filters are applied first and the sub-object filters are applied on the given field, per each returned document.

```graphql title="Return all fiction books from George Orwell"
{
  Person(filter: { name: { _eq: "George Orwell" } }) {
    name
    books(filter: { genre: { _eq: "Fiction" } } ) {
      title
      genre
    }
  }
}
```

## Operators and types  {/* #operators-types */}

### Supported operators  {/* #operators */}

| Operator | Description |
| -------- | --------    |
| `_eq`    | Equal to        |
| `_neq`   | Not Equal to        |
| `_gt`    | Greater Than        |
| `_gte`   | Greater Than or Equal to        |
| `_lt`    | Less Than        |
| `_lte`   | Less Than or Equal to        |
| `_in`    | In List        |
| `_nin`   | Not in List        |
| `_like`  | Like Sub-String (supports `%` wildcard)        |
|`_nlike`  | Unlike Sub-String (supports `%` wildcard)      |

### Operators supported by scalar types  {/* #operators-by-type */}

| Scalar Type | Operators |
| -------- | -------- |
| String     | `_eq, _neq, _like, _in, _nin`     |
| Integer     | `_eq, _neq, _gt, _gte, _lt, _lte, _in, _nin`     |
| Floating Point     | `_eq, _neq, _gt, _gte, _lt, _lte, _in, _nin`     |
| Boolean     | `_eq, _neq, _in, _nin`     |
| DateTime     | `_eq, _neq, _gt, _gte, _lt, _lte, _in, _nin`     |
