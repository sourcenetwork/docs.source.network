---
sidebar_label: Grouping
sidebar_position: 110
---

# Grouping

Grouping enables organizing the results of a query into sections or sub-groups based on a specific field. These sub-groups are formed by clustering objects with equal field values. Any object field may be used for grouping, and multiple fields can be specified in the `groupBy` clause for more granular segmentation.

When using the `groupBy` argument, which accepts an array of one or more fields, only the specified `groupBy` fields and aggregate function results can be included in the result object. To access the sub-groups of individual objects, a special return field called `_group` is available. This field corresponds to the root query type and can access any field in the object type.

In the example below, we query all books whose authors' names start with 'John'. The results are grouped by genre, returning the genre name along with the sub-groups `title` and `rating`.

```gql
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

The example demonstrates how the `groupBy` argument is used, accepting an array of field names, and how the special `_group` field is used to access sub-group elements.

Note that in the example, the only available field from the root `Book` type is the `groupBy` field `genre`, along with the special group and aggregate proxy fields.

## Grouping on Multiple Fields

As mentioned, any number of fields can be included in the `groupBy` argument for further data segmentation. These fields can also be accessed in the return object, as shown in the example below:

```gql
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

## Grouping on Related Objects

Objects often have related objects within their type definition, indicated by the `@relation` directive on the respective object. The grouping system can be used to split results based on related objects and root type fields.

When including a subtype with a `@relation` directive in the `groupBy` list, the entire related object's fields can be accessed. Only "One-to-One" and "One-to-Many" relations can be used in a `groupBy` argument.

Given a type definition defined as:

```graphql
type Book {
    title: String
    genre: String
    rating: Float
    author: Author @relation
}

type Author {
    name: String
    written: [Book] @relation
}
```

A group query can be created for books and their authors, as shown in the example below:

```gql
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

As shown, the entire `Author` object can be accessed in the main return object without using any special proxy fields.

Group operations can be performed with any combination of single or multiple fields, individual fields, or related objects, depending on the developer's needs.