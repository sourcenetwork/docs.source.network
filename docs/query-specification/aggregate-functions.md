---
sidebar_label: Aggregates Functions
sidebar_position: 115
---

# Aggregate Functions

The most common use case of grouping queries is to compute some aggregate function over the sub-group. Like the special `_group` field, aggregate functions are defined and returned using special fields. These fields prefix the target field name with the name of the aggregate function you wish to apply. If we had the field `rating`, we could access the average value of all sub-group ratings by including the special field `_avg { rating }` in our return object. The available aggregate functions and their associated scalars can be found above in `Table 3`.

The special aggregate function fields' format is the function name and the field name as its sub-elements. Specifically: `_$function { $field }`, where `$function` is the list of functions from `Table 3`, and `$field` is the field name to which the function will be applied to. E.g., applying the `max` function to the `rating` field becomes `_max { rating }`.

Let us augment the previous grouped books by genre example and include an aggregate function on the sub-groups ratings.
```javascript
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

Here we return the average of all the ratings of the books whose authors name begins with "John" grouped by the genres.

We can also use simpler queries, without any `groupBy` clause, and still use aggregate functions. The difference is, instead of applying the aggregate function to only the sub-group, it applies it to the entire result set.

Let's simply count all the objects returned by a given filter.
```javascript
{
    books(filter: {rating: {_gt: 3.5}}) {
        title
        _count
    }
}
```
This returns an array of objects that includes the respective books title, along with the repeated `_count` field, which is the total number of objects that match the filter.

> Note, the special aggregate field `_count` has no subfields selected, so instead of applying the `count` function to a field, it applies to the entire object. This is only possible with the `count` function; all the other aggregate functions must specify their target field using the correct field name selection.

We can further simplify the above count query by including only the `_count` field. If we ***only*** return the `_count` field, then a single object is returned, instead of an array of objects.

DefraDB also supports applying aggregate functions to relations just like we do fields. However, only the `count` function is available directly on the related object type.

## Having - Filtering & Ordering on Groups

When using group queries, it is often necessary to further filter the returned set based on aggregate function results' properties. The `Having` argument can be used to filter aggregate and group results further. A new system of filtering is required because the `filter` argument is applied before any grouping and aggregate. Hence, it cannot provide the necessary functionality.

In addition to filtering using the `having` argument, we can still use `limit` and `order` in the same way, since those operations are applied *after* the grouping and aggregation. Further explanation of the query execution pipeline is provided below.

Let us get all the books from the author John LeCare, group them by genre, calculate the average rating of these books, select the groups with at least an average rating of 3.5, and order them from highest to lowest.
```javascript
{
    books(filter{ author: {name: "John LeCare"} }, groupBy: [genre], having: { _avg: {rating: {_gt: 3.5}}}, order: { _avg: {rating: DESC}}) {
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

In the above example, we have combined several different query functionalities, including filtering data, followed by grouping and aggregating over the filtered data, further filtering the results again, and finally ordering the return set.

The `having` argument functions similar to the `filter` argument; it takes an object as its parameter. The difference lies in which fields can be included inside the `having` object parameter. Unlike the `filter` argument, **only** the fields from the `groupBy` argument, and any included aggregate field function can be used in `having`. Beyond this limitation, everything else functions the same, from operators' use and structure, to compound conditionals. This includes sub-objects that exist in the `groupBy` argument, which can have their respective fields included within a `having` argument.
