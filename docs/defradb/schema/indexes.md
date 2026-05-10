---
title: Indexes
---

By default, every collection has an index on the `_docID` property.
The `@index` directive allows you to set up further indexes on selected properties.

```graphql title="@index directive syntax"
@index(
  name: String,
  unique: Bool,
  direction: ORDERING,
  includes: [{ field: String, direction: ORDERING }]
)
```
- `name` &ndash; Index name.  
Default: concatenation of _collection name, field names, direction_.
- `unique` &ndash; Enforce uniqueness constraint (i.e. no two documents can have the same value for the given fields).  
Default: `false`.
- `direction` &ndash; The index order. This affects the default sorting of results when querying documents.  
Valid values: `ASC` or `DESC`.  
Default: `ASC`.
- `includes` &ndash; List of fields the index is created on. (Not required when the directive is used in a field definition).

## Index for individual fields

To create an index for a specific field in a collection, use the `@index` directive when defining the field.

```graphql title="Index the title property using default values"
type Book {
  // highlight-next-line
  title: String @index
}
```

```graphql title="Index multiple properties, separately, overriding defaults for name"
type Book {
  // highlight-next-line
  title: String @index(name: "book_title")
  // highlight-next-line
  plot: String @index(name: "book_plot")
}
```

```graphql title="Index a relationship property"
type Book {
    title: String
    // highlight-next-line
    author: Person @primary @index
}

type Person {
    name: String
    books: [Book]
}
```

## Unique indexes

An indexed unique field ensures that no two documents have the same value for one field. Null values are still allowed though.

```graphql title="Index the title property and enforce value uniqueness"
type Book {
// highlight-next-line
  title: String @index(unique: true)
}
```

When applied to a relationship field, the `@index(unique: true)` makes it into a [one-to-one relationship](collections.md#one-to-one). In the example below, no two `User` can share the same `Address`.

```graphql title="Define a one-to-one relationship between User and Address"
type User {
    name: String 
    age: Int
    // highlight-next-line
    address: Address @primary @index(unique: true)
} 

type Address {
    user: User
    city: String
    street: String 
}
```

## Index for multiple fields (composite)

To create an index on the combination of multiple fields (composite index), use the `@index` directive at the collection level.

```graphql title="(Unique) Index for (name, plot)"
// highlight-next-line
type User @index(unique: true, includes: [{field: "title"}, {field: "plot"}]) {
  title: String
  plot: String
}
```

## JSON fields indexing

JSON fields are treated specially: their leaf nodes are indexed, so that their structure can be traversed in queries. Each JSON field generates multiple entries in the index: one for every leaf node, each with their value and path.
For example, given a property of JSON format with the following value:

```json
{
  "user": {
    "device": {
      "os": "Linux"
    }
  }
}
```
You can query documents of that type filtering on the `user.device.os` property:

```graphql
query {
  Collection(filter: {
    jsonField: {
      user: {
        device: {
          model: {_eq: "Linux"}
        }
      }
    }
  })
}
```

:::note
Scalar types (ex. integers) are normalized to standard types (ex. int64).
:::

## Performance considerations

More indexes is not better. The right indexes is better.

Although an index can improve read performance, it will decrease write performance, because every document update/create must also update the relevant indexes.

- Create indexes based on your query patterns. If you are tempted to index every field, remember that there's no free lunch and that the overhead (in storage and write speed) is likely to outweigh the benefit.
- Use unique indexes only when necessary. Because they require extra validation, their performance impact is more significant.
