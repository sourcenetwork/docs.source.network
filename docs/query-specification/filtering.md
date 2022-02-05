---
sidebar_label: Filtering
sidebar_position: 50
---
# Filtering

Filtering is used to screen data entries containing the specified fields and predicates (including compound predicates) out of a collection of documents using conditional keywords like `_and`, `_or`, `_not`.

To accomplish this, the `filter` keyword can be applied as an argument to root level fields and subfields.

An empty `filter` object is equivalent to no filters being applied. Hence, the output will return all books. The following example displays an empty filter being applied on the root level field.

```javascript
{
	books(filter: {}) {
		title
		genre
		description
	}
}
```

Some filtering options depend on the available indexes on a field. However, we will not discuss them in this section.

To apply a filter to a specific field, we can specify it within the filter object.

The following only returns books with the title “A Painted House”.

```javascript
{
	books(filter: { title: "A Painted House" }) {
		title
		genre
		description
	}
}
```

We can apply filters to multiple / all fields available.

NOTE: Each additional field listed in the filter object implies a conditional AND relation.

```javascript
{
	books(filter: { title: "A Painted House", genre: "Thriller" }) {
		title
		genre
		description
	}
}
```

The above query only returns books with the title “A Painted House” AND genre “Thriller”.

Filters can also be applied on subfields that have relational objects within them.

For example: A Book object, with an Author field, has a many-to-one relationship to the Author object. Then we can query and filter based on the value of the Author field.

```javascript
{
	books(filter: { genre: "Thriller", author: {name: "John Grisham"}}) {
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

Filtering from the root object, compared to sub objects results in different semantics. Root filters that apply to sub objects, like the `author` section of the above query, only returns the root object type if there is a match to the sub object filter. E.g. the code snippet only returns books, if the author filter condition accepts.

This applies to both single sub-objects, and array sub-objects. Meaning, if we apply a filter on a sub-object, and that sub-object is an array, we will **only** return the root object, if at least one sub-object matches the given filter instead of requiring **every** sub-object to match the query. 

The following query will only return authors, if they have **at least** one book whose genre is a thriller
```javascript
{
    authors(filter: {book: {genre: {_eq: "Thriller"}}}) {
        name
        bio
    }
}
```

Moreover, if we include the sub-object we filter on, which is an array, in the selection set, the filter is then implicitly applied unless specified otherwise.

From the above query, let's add `books` to the selection set.
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

Here, the `books` section will only contain books that match the root object filter, E.g.: `{genre: {_eq: "Thriller"}}`. If we wish to return the same authors from the above query and include *all* their books, we can directly add an explicit filter to the sub-object instead of just the sub-filters.

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

Here, we only return authors who have at least one book with the genre set to "Thriller". However, we then return **all** that specific authors' books, instead of just their thrillers.

Applying filters solely to sub-objects, which is only applicable for Array types, is computed independently from the root object filters.

```javascript
{
	authors(filter: {name: "John Grissam"}) {
		name
		bio
		books(filter: { genre: "Thriller" }) {
			title
			genre
			description
		}
}
```

The above query returns all authors with the name “John Grisham”, then filters and returns all the returned authors' books whose genre is “Thriller”. This is similar to the previous query, but an important distinction is that it will return all the matching Author objects regardless of the book's sub-object filter. 

The first query, will only return if there are Thriller books AND its author is “John Grisham”. The second query always returns all authors named “John Grishams”, and if they have some books with the genre “Thriller”, return those as well.

So far, we have only looked at EXACT string matches, but we can filter on any scalar type or object fields, like booleans, integers, floating points, and more. To use other comparison operators, we can specify Greater Than, Less Than, Equal or Greater than, Less Than or Equal to, and of course, EQUAL. 

Let's query for all books with a rating greater than or equal to 4.
```javascript
{
	books(filter: { rating: { _gte: 4 } }) {
		title
		genre
		description
}
```

Note, our filter expression contains a new object `{ _gte: 4 }`, instead of before, where we had a simple string value. If a field is a scalar type, and its filter is given an object value, that object's first and only key must be a comparator operator like `_gte`. If the filter is given a simple scalar value, like “John Grisham”, “Thriller”, or FALSE, the default operator is `_eq` (EQUAL).

See the following table for a reference of available operators


| Operator | Description |
| -------- | --------    |
| `_eq`    | Equal to        |
| `_neq`   | Not Equal to        |
| `_gt`    | Greater Than        |
| `_gte`   | Greater Than or Equal to        |
| `_lt`    | Less Than        |
| `_lte`   | Less Than or Equal to        |
| `_in`    | In the List        |
| `_nin`   | Not in the List        |
| `_like`  | Sub-String Like        |
###### Table 1. Supported operators.

See the following table for a reference of which operators can be used on which types


| Scalar Type | Operators |
| -------- | -------- |
| String     | `_eq, _neq, _like, _in, _nin`     |
| Integer     | `_eq, _neq, _gt, _gte, _lt, _lte, _in, _nin`     |
| Floating Point     | `_eq, _neq, _gt, _gte, _lt, _lte, _in, _nin`     |
| Boolean     | `_eq, _neq, _in, _nin`     |
| Binary     | `_eq, _neq`     |
| DateTime     | `_eq, _neq, _gt, _gte, _lt, _lte, _in, _nin`     |
###### Table 2. Operators supported by Scalar types.

To use multiple filters, as we saw above, the AND predicate is implied given a list of fields to filter on, however, we can explicitly indicate what conditional we want to use. This includes `_and`, `_or`, and `_not`. The _and and _or conditionals accept a list of predicate filters to apply to, whereas the _not conditional accepts an object.

Lets' query all books that are a part of the Thriller genre, or have a rating between 4 to 5.
```javascript
{
    books(
        filter: { 
            _or: [ 
                {genre: "Thriller"}, 
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

An important thing to note about the above query is the _and conditional. Even though AND is assumed, if we have two filters on the same field, we MUST specify the _and operator, since JSON objects cannot contain duplicate fields.
>**Invalid**:
`filter: { rating: { _gte: 4 }, rating { _lte: 5 } }`
>**Valid**:
`filter: { _and: [ {rating: {_gte: 4}}, {rating: {_lte: 5}} ]}`

The `_not` conditional accepts an object instead of an array.

> Filter all objects that *do not* have the genre "Thriller"
> `filter: { _not: { genre: "Thriller" } }`

*Using the `_not` operator should be used only when the available filter operators like `_neq` do not fit the use case.*
