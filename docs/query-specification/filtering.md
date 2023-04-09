---
sidebar_label: Filtering
sidebar_position: 50
---

# Filtering

Filtering is utilized to extract data entries containing specified fields and predicates (including compound predicates) from a collection of documents using conditional keywords such as `_and`, `_or`, and `_not`. The `filter` keyword can be applied as an argument to root level fields and subfields.

An empty `filter` object is equivalent to not applying any filters. Consequently, the output will return all books. The following example demonstrates an empty filter being applied to the root level field.

```gql
{
	books(filter: {}) {
		title
		genre
		description
	}
}
```

Some filtering options depend on the available indexes on a field. However, these will not be discussed in this section.

To apply a filter to a specific field, it can be specified within the filter object. The example below returns books with the title “A Painted House” only.

```gql
{
	books(filter: { title: { _eq: "A Painted House" }}) {
		title
		genre
		description
	}
}
```

Filters can be applied to all or multiple fields available.

**NOTE:** Each additional field listed in the filter object implies a conditional AND relation.

```gql
{
	books(filter: { title: {_eq: "A Painted House"}, genre: {_eq: "Thriller" }}) {
		title
		genre
		description
	}
}
```

The above query returns books with the title “A Painted House” AND genre “Thriller” only.

Filters can also be applied to subfields with relational objects. For example, if a Book object has an Author field with a many-to-one relationship to the Author object, it is possible to query and filter based on the value of the Author field.

```gql
{
	books(filter: { genre: {_eq: "Thriller"}, author: {name: {_eq: "John Grisham"}}}) {
		title
		genre
		description
		author {
			name
			bio
		}
}
```

This query returns all books authored by “John Grisham” with the genre “Thriller”.

Applying filtering from the root object level, as opposed to the sub-object level, results in different semantics. Root filters applying to sub-objects (e.g., the `author` section of the above query) only return the root object type if both the root object and sub-object conditions are fulfilled. For instance, if the author filter condition is satisfied, the above code snippet returns books only.

This applies to both single sub-objects and array sub-objects. That is, if a filter is applied to a sub-object array, the output **only** returns the root object if at least one sub-object matches the given filter, rather than requiring **every** sub-object to match the query. For example, the following query returns authors only if they have **at least** one book in the "Thriller" genre.

```gql
{
    authors(filter: {book: {genre: {_eq: "Thriller"}}}) {
        name
        bio
    }
}
```

Additionally, if the sub-object array being filtered on is included in the selection set, the filter is implicitly applied unless otherwise specified.

In the query snippet above, let's add `books` to the selection set using the query below.

```
{
    authors(filter: {book: {genre: {_eq: "Thriller"}}}) {
        name
        bio
        books {
            title
            genre
        }
    }
}
```

Here, the `books` section contains only books that match the root object filter, specifically, `{genre: {_eq: "Thriller"}}`. To return the same authors from the above query and include *all* their books, an explicit filter can be added directly to the sub-object instead of sub-filters.

```
{
    authors(filter: {book: {genre: {_eq: "Thriller"}}}) {
        name
        bio
        books(filter: {}) {
            title
            genre
        }
    }
}
```

In the code snippet above, the output returns authors with at least one book in the "Thriller" genre, as well as **all** books written by these selected authors (not just thrillers).

Filters applied solely to sub-objects, which are only applicable for array types, are computed independently from the root object filters.

```gql
{
	authors(filter: {name: {_eq: "John Grisham"}}) {
		name
		bio
		books(filter: { genre: {_eq: "Thriller" }}) {
			title
			genre
			description
		}
}
```

The above query returns all authors named “John Grisham” and filters all returned authors' books with the genre “Thriller”. This is similar to the previous query, but the key difference is that it returns all matching author objects regardless of the book's sub-object filter.

The first query returns an output only if there are any "Thriller" books written by the author “John Grisham” (using an AND condition, i.e., both conditions must be fulfilled). The second query always returns all authors named “John Grisham” and their "Thriller" genre books.

So far, examples have only demonstrated EXACT string matches, but filtering can also be performed using scalar value type or object fields, such as booleans, integers, floating points, etc. Additionally, comparison operators like Greater Than, Less Than, Equal To or Greater than, Less Than or Equal To, and EQUAL can be used.

Let's query for all books with a rating greater than or equal to 4.

```gql
{
	books(filter: { rating: { _gte: 4 } }) {
		title
		genre
		description
}
```

**NOTE:** In the above example, the expression contains a new scalar type object `{ _gte: 4 }`. Previously, a simple string value was used. If a scalar type field has a filter with an object value, then the first and only key of that object must be a comparison operator like `_gte`. If the filter is given a simple scalar value like “John Grisham”, “Thriller”, or FALSE, the default operator used is `_eq` (EQUAL). The following table displays a list of available operators:

| Operator | Description       |
| -------- | ----------------- |
| `_eq`    | Equal to          |
| `_neq`   | Not Equal to      |
| `_gt`    | Greater Than      |
| `_gte`   | Greater Than or Equal to |
| `_lt`    | Less Than         |
| `_lte`   | Less Than or Equal to   |
| `_in`    | In the List       |
| `_nin`   | Not in the List       |
| `_like`  | Sub-String Like       |
###### Table 1. Supported operators.

The table below displays the operators applicable to each value type:

| Scalar Type | Operators                             |
| ----------- | ------------------------------------- |
| String      | `_eq, _neq, _like, _in, _nin`         |
| Integer     | `_eq, _neq, _gt, _gte, _lt, _lte, _in, _nin` |
| Floating Point | `_eq, _neq, _gt, _gte, _lt, _lte, _in, _nin` |
| Boolean     | `_eq, _neq, _in, _nin`               |
| Binary      | `_eq, _neq`                           |
| DateTime    | `_eq, _neq, _gt, _gte, _lt, _lte, _in, _nin` |
###### Table 2. Operators supported by Scalar types.

There are three types of conditional keywords: `_and`, `_or`, and `_not`. Conditional keywords like `_and` and `_or` are used when applying filters to multiple fields simultaneously. The `_not` conditional keyword only accepts an object.

The code snippet below queries all books that are part of the "Thriller" genre or have a rating between 4 and 5.

```gql
{
    books(
        filter: { 
            _or: [ 
                {genre: {_eq: "Thriller"}}, 
                { _and: [
                    {rating: { _gte: 4 }},
                    {rating: { _lte: 5 }},
                ]},
            ]
        }
    )
	title
	genre
	description
}
```

An important point to note about the above query is the `_and` conditional. Although AND is assumed, if there are two filters on the same field, the `_and` operator must be specified. This is because JSON objects cannot contain duplicate fields.

>**Invalid**:
> `filter: { rating: { _gte: 4 }, rating { _lte: 5 } }`
>**Valid**:
> `filter: { _and: [ {rating: {_gte: 4}}, {rating: {_lte: 5}} ]}`

The `_not` conditional accepts an object instead of an array.

> Filter all objects that *do not* have the genre "Thriller"
> `filter: { _not: { genre: { _eq: "Thriller" } } }`

The `_not` operator should be used only when the available filter operators like `_neq` do not fit the use case.