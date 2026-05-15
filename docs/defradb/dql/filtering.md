---
title: Filter documents
---

Filters allow you to specify criterias for selecting documents. You provide them with an optional `filter` object. You can filter on the following:
- [Individual fields]()
- [A combination of fields]()
- [Relationship sub-objects]()

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

## Individual fields

```graphql title="Return books with title 'A Painted House'"
{
  Books(filter: { 
    title: { _eq: "A Painted House" }
  }) {
    title
    genre
    description
  }
}
```

- `fieldName: { operator: Value }`

Where:
- `operator` &ndash; The [comparison operator](#operators) to use
- `fieldName` &ndash; The name of the field to filter
- `Value` &ndash; To value to compare against, of the same type of `fieldName`

Additional fields listed in the filter object are implicitly combined with an `AND` operator.

```graphql title="Return books with title 'A Painted House' and genre 'Thriller'"
{
  Books(filter: {  # filters combined with AND by default
    title: { _eq: "A Painted House" }, 
    genre: { _eq: "Thriller" }
  }) {
    title
    genre
    description
  }
}
```

You must however explicitly specify the `_and` operator in case of two filters on the same field, because JSON objects cannot contain duplicate fields:

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

## Combine fields

- `operator: [ { fieldName: Value }, ... ]`

Where:
- `operator` &ndash; The [comparison operator](#operators) to use
- `fieldName` &ndash; The name of the field to filter
- `Value` &ndash; To value to compare against, of the same type of `fieldName`

```graphql title="Retrieve all books that either have Genre == Fiction, or rating between 4 and 5"
{
  Books(
    filter: {
      _or: [
	{ genre: { _eq: "Thriller" } },
	{ _and: [
	  { rating: { _gte: 4 } },
	  { rating: { _lte: 5 } },
	] },
      ]
    }
  )
  title
  genre
  description
}
```

There are 3 types of conditional keywords, i.e, `_and`, `_or`, and `_not`. Conditional keywords like `_and` and `_or` are used when we need to apply filters on multiple fields simultaneously.  The `_not` conditional keyword only accepts an object.

The `_not` conditional accepts an object instead of an array.

> Filter all objects that *do not* have the genre "Thriller"
> `filter: { _not: { genre: { _eq: "Thriller" } } }`


## Relationship sub-objects

- `relFieldName: { fieldName: { operator: Value } }` + nesting on fieldName

Where:
- `operator` &ndash; The [comparison operator](#operators) to use
- `fieldName` &ndash; The name of the field to filter
- `Value` &ndash; To value to compare against, of the same type of `fieldName`

You can also apply filters to a relationship's fields.

```graphql title="Filter books by genre and author's name"
{
  Books(filter: { genre: {_eq: "Thriller"}, author: {name: {_eq: "John Grisham"}}}) {
    title
    genre
    plot
    Person {
      name
    }
  }
}
```

When filtering over 1:many rels, a doc is returned if at least one of the linked docs fulfills, not if all do.
```graphql
{
  Person(filter: {authoredBooks: {genre: {_eq: "Thriller"}}}) {
    name
    bio
  }
}
```

Additionally, in the selection set, if we include the sub-object array we are filtering on, the filter is then implicitly applied unless otherwise specified.

In the query snippet above, let's add `books` to the selection set using the query below .
```graphql
{
	Authors(filter: {book: {genre: {_eq: "Thriller"}}}) {
        name
        bio
        books {
            title
            genre
        }
    }
}
```

Here, the `books` section will only contain books that match the root object filter, namely, `{genre: {_eq: "Thriller"}}`. If we wish to return the same authors from the above query and include *all* their books, we can add an explicit filter directly to the sub-object instead of the sub-filters.

```graphql
{
    Authors(filter: {book: {genre: {_eq: "Thriller"}}}) {
        name
        bio
        books(filter: {}) {
            title
            genre
        }
    }
}
```

In the code snippet above, the output returns authors who have at least one book with the genre "Thriller". The output also returns **all** the books written by these selected authors (not just the thrillers).

Filters applied solely to sub-objects, which are only applicable for array types, are computed independently from the root object filters.

```graphql
{
	Authors(filter: {name: {_eq: "John Grisham"}}) {
		name
		bio
		books(filter: { genre: {_eq: "Thriller" }}) {
			title
			genre
			description
		}
	}
}
```

The above query returns all authors with the name “John Grisham”, then filters and returns all the returned authors' books with the genre “Thriller”. This is similar to the previous query, but an important distinction is that it will return all the matching author objects regardless of the book's sub-object filter.

## Operators and types  {/* #operators */}

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
###### Table 1. Supported operators. {/* #table-1-supported-operators */}

The table below displays the operators that can be used for every value type:

| Scalar Type | Operators |
| -------- | -------- |
| String     | `_eq, _neq, _like, _in, _nin`     |
| Integer     | `_eq, _neq, _gt, _gte, _lt, _lte, _in, _nin`     |
| Floating Point     | `_eq, _neq, _gt, _gte, _lt, _lte, _in, _nin`     |
| Boolean     | `_eq, _neq, _in, _nin`     |
| DateTime     | `_eq, _neq, _gt, _gte, _lt, _lte, _in, _nin`     |
###### Table 2. Operators supported by Scalar types. {/* #table-2-operators-supported-by-scalar-types */}
