---
sidebar_label: Variables
sidebar_position: 100
---
# Variables

Variables are used in DefraDB to store both input placeholder values, and interim query results. DefraDB makes use of interim queries to allow for query composition, that is, using query results as inputs to other queries. This is similar to nested SQL `SELECT` statements. Variables can be used in place of string interpolation to create more efficient queries.

## Input Variables

Input variables can be used in place of complex string interpolation to allow for operational simplicity for developers. DefraDB will natively handle the string interpolation internally, creating an easy workflow. Variables are strongly typed at the time of definition, and queries that are given incorrect variable types will return an error. Variables are defined in the `query` keyword, along with their types, and are indicated by a `$` prefix.

```graphql
query($myVar: Int) {
    books(filter{ rating: $myVar}) {
        title
        genre
        description
    }
}

{
    "myVar": 4
}
```

Here we define the variable `$myVar` which is of type `Int`, used by the books filter on the rating field. We supply the variables as a `JSON` object at the end of the query. With, its keys matching the defined variables, any additional keys provided that don't match the defined variables will result in an error.

## Sub Queries

Subqueries are used to store interim query results to be used later on in the currently executing query. They can be used to logically break up a query into components or create a new set of data to filter, which would otherwise be cumbersome.

Subqueries are defined as any other additional query, except using a special alias name indicated by a reserved variable prefix `$_[sub query name]`. All subqueries are not returned in the result, but their contents can be utilized in other parts of the query.

The values of the subquery are stored in the special subquery variable defined using the `$_` prefix. They are managed as a map of type `Map<ID, Object>` a map with `IDs` as the key, and `Objects` as the value, where the `Object` is the return type of the subquery. Subqueries have no concept of an ordering since any desired ordering can be applied on the final query, so any `sort` input given to a subquery will return an error.

A subquery must always return *at least* the `_id` field of the returned type, any other field is optional. Unless other fields are necessary, it is best to solely use the `_id` field, due to the optimizations it affords the engine.

Subquery results, represented by the prefixed variable, can be used as many other arguments within the `filter` object. It can act like both an array of `IDs`, allowing operators like `_in` and `_nin`, as well as being able to access the fields of the object through a map operator

> ** More on-map operations for subqueries to be added! [color=red]**

```javascript
// Select all books published by X reviewed by authors belonging to a publisher Y
{
    _authorsOfPubY: authors(filter: { written: { publishedBy: {name: "Y"}}}) {
        _id
    }
    
    books(filter: {publishedBy: { name: "X" }, reviewedBy: {_in: $_authorsOfPubY}}) {
        title
        genre
        description
    }
}
```

This query utilizes a subquery, defined as `$_authorsOfPubY` which is all the authors who have books published by the publisher with the name "Y". The results of the subquery are then later used in the main query as a list of `IDs` to compare against the `reviewedBy` field using the array `_in` operator, which returns true if the value at `reviewedBy` is anywhere within the subquery `$_authorsOfPubY`. This query will only return the `books` result, as subqueries are not included in the results output.
