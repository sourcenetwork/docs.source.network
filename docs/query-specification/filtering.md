---
weight: 40
---
## Filtering

Provided a collection of documents, we can filter on a number of fields and predicates, including compound predicates via conditional keywords like (_and, _or, _not).

Basic filtering is exposed through the filter keyword, and can be supplied as arguments to a root level field, or subfields that contain some kind of embedding or relation.

The following shows the use of the filter keyword on the root level books field. An empty filter object is equivalent to no filters at all, so it will match all objects it is applied to. In this case, it will return all books.

```javascript
{
	books(filter: {}) {
		title
		genre
		description
	}
}
```
Some of the available filtering options depend on the available indexes on a field, but, we will omit this for now.

To apply a filter to a specific field, we can specify it within the filter object.

The following only returns books with the title “A Painted House”

```javascript
{
	books(filter: { title: "A Painted House" }) {
		title
		genre
		description
	}
}
```

We can apply filters to as many fields as are available. Note, each additional listed field in the filter object implies an AND conditional relation.

```javascript
{
	books(filter: { title: "A Painted House", genre: "Thriller" }) {
		title
		genre
		description
	}
}
```

The above query is equivalent to the statement: Return all the books with the title “A Painted House” AND whose genre is “Thriller”.

Filtering is also possible on subfields that have relational objects within them.

Given a Book object, with an Author field which is a many-to-one relationship to the Author object, we can query and filter based on Author field value.

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

This query returns all books authored by "John Grisham" with the genre “Thriller”.

Filtering from the root object, compared to sub objects results in different semantics. Root filters that apply to sub objects, like the author section of the above query, only return the root object type if there is a match to the sub object filter. E.g. We will only return books, if the author filter condition accepts.

This applies to both single sub-objects, and array sub-objects. Meaning, if we apply a filter on a sub-object, and that sub-object is an array, we will only return the root object, if at least one sub-object matches the given filter instead of requiring every sub-object to match the query.

The following query will only return authors, if they have at least one book whose genre is a thriller

```javascript
{
    authors(filter: {book: {genre: {_eq: "Thriller"}}}) {
        name
        bio
    }
}
```

Moreover, if we include the sub-object we filter on, which is an array, in the selection set, the filter is then implicitly applied unless specified otherwise.

From the above query, let’s add books to the selection set.

```javascript
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

Here, the books section will only contain books that match the root object filter, E.g.: {genre: {_eq: "Thriller"}}. If we wish to return the same authors from the above query and include all their books, we can directly add an explicit filter to the sub-object instead of just the sub-filters.

```javascript
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

Here, we only return authors who have at least one book with the genre set to “Thriller”. However, we then return all that specific authors’ books, instead of just their thrillers.

Applying filters solely to sub-objects, which is only applicable for Array types, is computed independently from the root object filters.

```javascript
{
	authors(filter: {name: "John Grisham"}) {
		name
		bio
		books(filter: { genre: "Thriller" }) {
			title
			genre
			description
		}
}
```

The above query returns all authors with the name “John Grisham”, then filters and returns all the returned authors’ books whose genre is “Thriller”. This is similar to the previous query, but an important distinction is that it will return all the matching Author objects regardless of the book’s sub-object filter.

The first query, will only return if there are Thriller books AND its author is “John Grisham”. The second query always returns all authors named “John Grishams”, and if they have some books with the genre “Thriller”, return those as well.

So far, we have only looked at EXACT string matches, but we can filter on any scalar type or object fields, like booleans, integers, floating points, and more. To use other comparison operators, we can specify Greater Than, Less Than, Equal or Greater than, Less Than or Equal to, and of course, EQUAL.

Let’s query for all books with a rating greater than or equal to 4.

```javascript
{
	books(filter: { rating: { _gte: 4 } }) {
		title
		genre
		description
}
```
:::note
Our filter expression contains a new object { _gte: 4 }, instead of before, where we had a simple string value. If a field is a scalar type, and its filter is given an object value, that object’s first and only key must be a comparator operator like _gte. If the filter is given a simple scalar value, like “John Grisham”, “Thriller”, or FALSE, the default operator is _eq (EQUAL).
:::

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

