---
sidebar_label: Variables
sidebar_position: 100
---

# Variables

Variables in DefraDB are used to store placeholder values for inputs and interim query results. They enable query composition through the use of interim queries, which are similar to nested SQL `SELECT` statements. Variables can replace string interpolation, leading to more efficient queries.

## Input Variables

Input variables provide a simpler alternative to complex string interpolation, making it easier for developers to work with DefraDB. DefraDB handles string interpolation internally, resulting in a streamlined workflow. Variables are strongly typed when defined, and queries with incorrect variable types will produce an error. Variables can be declared within the `query` keyword along with their types, and are prefixed with a `$` symbol.

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

In the example above, the variable `$myVar` of type `Int` is defined to be used by the books filter on the rating field. The variables are supplied as a JSON object at the end of the query, where keys correspond to the defined variables. Providing additional keys that do not match the defined variables will result in an error.

## Sub Queries

Subqueries are used to store temporary query results for further use within the current query. This allows for the logical separation of a query into components or the creation of new data sets to filter, which would otherwise be difficult.

Subqueries are defined like any other query, but with a unique alias name indicated by a reserved variable prefix `$_[sub query name]`. Subqueries are not included in the final result, although their contents can be used in other parts of the query.

The values of the subquery are stored in the special subquery variable defined with the `$_` prefix. They are managed as a map of type `Map<ID, Object>`, where the `ID` is the key and the `Object` is the return type of the subquery. Subqueries do not have an ordering concept, as any desired ordering can be applied to the final query. Providing a `sort` input to a subquery will result in an error.

A subquery must always return *at least* the `_id` field of the returned type. Any other field is optional. However, it is recommended to use only the `_id` field when possible due to the optimizations it provides the engine.

Subquery results, represented by the prefixed variable, can be used as arguments within the `filter` object. They can function as both an array of `IDs`, supporting operators like `_in` and `_nin`, as well as accessing the fields of the object through a map operator.

> **More map operations for subqueries will be added soon!**

```gql
// Select all books published by X and reviewed by authors belonging to a publisher Y
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

In this example, a subquery is defined as `$_authorsOfPubY`, which includes all authors who have books published by the publisher with the name "Y". The subquery results are then used in the main query as a list of `IDs` to be compared against the `reviewedBy` field using the array `_in` operator. This operator returns true if the value at `reviewedBy` is found within the subquery `$_authorsOfPubY`. The final output will only include the `books` result since subqueries are not part of the result set.