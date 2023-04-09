---
sidebar_label: Aggregates Functions
sidebar_position: 115
---

# Aggregate Functions

Aggregate functions are commonly used in grouping queries to compute specific values over the sub-group. Like the special `_group` field, aggregate functions are defined and returned using special fields. These fields are formatted by prefixing the target field name with the name of the aggregate function. For example, if we have a field named `rating`, we can access the average value of all sub-group ratings by including the special field `_avg { rating }` in our return object. The available aggregate functions and their associated scalars can be found in `Table 3`.

The special aggregate function fields follow this format: `_$function { $field }`, where `$function` refers to a list of functions from `Table 3`, and `$field` is the name of the field to which the function will be applied. For example, applying the `max` function to the `rating` field would be represented as `_max { rating }`.

Let's augment the previous example of grouped books by genre and include an aggregate function on the sub-groups' ratings.
```gql
{
    books(filter: {author: {name: {_like: "John%"}}}, groupBy: [genre]) {
        genre
        _avg {
            rating
            points
        }
        _group {
            title
            rating
        }
    }
}
```

This query returns the average rating of all books whose author's name begins with "John", grouped by genre.

We can also use simpler queries without a `groupBy` clause and still utilize aggregate functions. The difference is that the aggregate function will be applied to the entire result set instead of only the sub-group.

Consider a query that counts all the objects returned by a given filter.
```gql
{
    books(filter: {rating: {_gt: 3.5}}) {
        title
        _count
    }
}
```
This query returns an array of objects that include the respective book titles and the repeated `_count` field, which represents the total number of objects that match the filter.

> Note that the special aggregate field `_count` has no subfields selected; instead of applying the `count` function to a field, it applies to the entire object. This is only possible with the `count` function; all other aggregate functions must specify their target field using the correct field name selection.

We can further simplify the above count query by including only the `_count` field. If we ***only*** return the `_count` field, then a single object is returned, instead of an array of objects.

DefraDB also supports applying aggregate functions to relations just like we do fields. However, only the `count` function is available directly on the related object type.

## Having - Filtering & Ordering on Groups

When using group queries, it is often necessary to further filter the returned set based on the properties of the aggregate function results. The `Having` argument can be employed to refine aggregate and group results further. A new system of filtering is required because the `filter` argument is applied before any grouping and aggregation, and thus, it cannot provide the necessary functionality.

In addition to filtering using the `having` argument, we can still use `limit` and `order` in the same way, since those operations are applied *after* the grouping and aggregation. Further explanation of the query execution pipeline is provided below.

Let's get all the books from author John LeCare, group them by genre, calculate the average rating of these books, select the groups with at least an average rating of 3.5, and order them from highest to lowest.
```gql
{
    books(filter: {author: {name: "John LeCare"}}, groupBy: [genre], having: { _avg: {rating: {_gt: 3.5}}}, order: { _avg: {rating: DESC}}) {
        genre
        _avg {
            rating
        }
        _avg(field: rating)
        
        books: _group{
            title
            rating
            description
        }
    }
}
```

In the example above, we have combined several different query functionalities, including filtering data, followed by grouping and aggregating the filtered data, further filtering the results, and finally ordering the return set.

The `having` argument functions similarly to the `filter` argument; it takes an object as its parameter. The difference lies in the fields that can be included inside the `having` object parameter. Unlike the `filter` argument, **only** the fields from the `groupBy` argument and any included aggregate field function can be used in `having`. Beyond this limitation, everything else functions the same, from the use and structure of operators to compound conditionals. This includes sub-objects that exist in the `groupBy` argument, which can have their respective fields included within a `having` argument.