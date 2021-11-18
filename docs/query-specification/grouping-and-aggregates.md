---
sidebar_label: Grouping and Aggregates
sidebar_position: 110
---
# Grouping and Aggregates

![](https://img.shields.io/badge/Coming-Next_Version-green)

Grouping and aggregation is an essential aspect of any data query language as it provides a method of computation for such things as analytics and metrics of data. DefraDB natively supports the grouping of data objects and aggregation functions over the defined groups. Supported aggregate functions are: `count`, `max`, `min`, `sum`, and `avg`. The following table breaks down which base scalar types support which aggregate functions



| Scalar Type | Aggregate Functions |
| -------- | -------- |
| String     | `count`     |
| Integer     | `count, max, min, sum, avg`     |
| Float     | `count, max, min, sum, avg`     |
| Boolean     | `count`     |
| Binary     | `count`     |
| DateTime     | `count, max, min`     |
###### *Table 3: Aggregate functions available on each base scalar type*

#### Grouping
Grouping allows a collection of results from a query to be "grouped" into sections based on some field. These sections are called sub-groups, and are based on the equality of fields within objects, resulting in clusters of groups. Any object field may be used to group objects together. Additionally, multiple fields may be used in the group by clause to further segment the groups over multiple dimensions.

Once one or more group by fields have been selected using the `groupBy` argument, which accepts an array of length one or more you may only access certain fields in the return object. Only the indicated `groupBy` fields and aggregate function results may be included in the result object. If you wish to access the sub-groups of individual objects, a special return field is available called `_group` which matches the root query type, and can access any field in the object type.

Here we query for all the books whose author's name begins with 'John', then group the results by genre, and finally return the genre name and the sub-groups `title` and `rating`.
```javascript
{
    books(filter: {author: {name: {_like: "John%"}}}, groupBy: [genre]) {
        genre
        _group {
            title
            rating
        }
    }
}
```

In this example we see how the `groupBy` argument is provided, and that it accepts an array of field names, and, how the special `_group` field can be used to access the sub-group elements. 

It's important to note that in this example the only available field from the root `Book` type is the `groupBy` field `genre`, along with the special group and aggregate proxy fields.

#### Grouping on Multiple Fields
As mentioned, we can include any number of fields in the `groupBy` argument to segment the data further. Which can then also be accessed in the return object, like so.
```javascript
{
    books(filter: {author: {name: {_like: "John%"}}}, groupBy: [genre, rating]) {
        genre
        rating
        _group {
            title
            description
        }
    }
}
```

#### Grouping on Related Objects
Objects often have related objects within their type definition indicated by the `@relation` directive on the respective object. We can use the grouping system to split results over the related objectand the root type fields.

Like any other group query, we are limited in which fields we can access indicated by the `groupBy` argument's fields. If we include a subtype that has a `@relation` directive in the `groupBy` list, we can access the entire relations fields.

Only "One-to-One" and "One-to-Many" relations can be used in a `groupBy` argument.

Given a type definition defined as:
```graphql
type Book {
    title: String
    genre: String
    rating: Float
    author: Author @relation
}

type Author {
    name string
    written [Book] @relation
}
```

We can create a group query over books and their authors like so.
```javascript
{
    books(groupBy: [author]) {
        author {
            name
        }
        _group {
            title
            genre
            rating
        }
    }
}
```

As you can see, we can access the entire `Author` object in the main return object without having to use any special proxy fields.

Group operations can include any combination, single or multiple, individual field or related object, that a developer needs.


#### Aggregate Functions
The most common use case of grouping queries is to compute some aggregate function over the sub-group. Like the special `_group` field, aggregate functions are defined and returned using special fields. These fields prefix the target field name with the name aggregate function you wish to apply. If we had the field `rating`, we could access the average value of all sub-group ratings by including the special field `_avg { rating }` in our return object. The available aggregate functions and their associated scalars they apply to can be found above in `Table 3`.

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

> Note, the special aggregate field `_count` has no subfields selected, so instead of applying the `count` function to a field, it applies to the entire object. This is only possible with the `count` function; all the other aggregate functions must specify their target field using the correct field name selection. [color=orange]

We can further simplify the above count query by including only the `_count` field. If we ***only*** return the `_count` field, then a single object is returned, instead of an array of objects.

DefraDB also supports applying aggregate functions to relations just like we do fields. However, only the `count` function is available directly on the related object type.


#### Having - Filtering & Ordering on Groups
When using group queries, it is often necessary to further filter the returned set based on aggregate function results' properties. The `Having` argument can be used to filter aggregate and group results further. A new system of filtering is required because the `filter` argument is applied before any grouping and aggregate, so it isn't able to provide the necessary functionality.

In addition to filtering using the `having` argument, we can still `limit` and `order` in the same way, since those operations are applied *after* the grouping and aggregation. Further explanation of the query execution pipeline is below.

Let us get all the books from the author John LeCare, grouped by genre, calculate the average rating of those books, select the groups with at least an average rating of 3.5, and order them from highest to lowest.
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

Here we've combined several different query functionalities, including filtering data, followed by grouping and aggregating over the filtered data, further filtering the results again, and finally ordering the return set.

The `having` argument functions similar to the `filter` argument; it, takes an object as its parameter. The difference is what fields can be included inside the `having` object parameter. Unlike the `filter` argument, **only** the fields from the `groupBy` argument, and any included aggregate field function can be used in `having`. Beyond that limitation, everything else functions the same, from operators' use and structure, to compound conditionals. This includes sub-objects that exist in the `groupBy` argument; they can then have their respective fields included within a `having` argument.

