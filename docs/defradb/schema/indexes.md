---
title: Indexes
---

By default, every collection has an index on the `_docID` property and on `@primary` relationship fields.
The `@index` directive allows you to set up further indexes on selected properties.

```graphql title="Syntax &ndash; @index directive"
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
- `direction` &ndash; Order direction. This affects the default sorting of results when querying documents.  
Valid values: `ASC` or `DESC`.  
Default: `ASC`.
- `includes` &ndash; List of fields the index is created on (not required when the directive is used in a field definition).

## Indexes for individual fields {/* #single */}

To create an index for a specific field, use the `@index` directive on the field when creating the collection.

```graphql title='Index the "title" property using default values'
type Book {
  # highlight-next-line
  title: String @index
}
```

```graphql title='Index multiple properties, individually, overriding defaults for "name"'
type Book {
  # highlight-next-line
  title: String @index(name: "book_title")
  # highlight-next-line
  plot: String @index(name: "book_plot")
}
```

```graphql title="Index a relationship property"
type Book {
    title: String
    # highlight-next-line
    author: Person @primary @index
}

type Person {
    name: String
    books: [Book]
}
```

## Unique indexes {/* #unique */}

An indexed unique field ensures that no two documents have the same value for one field. Null values are still allowed though.

```graphql title="Index the title property and enforce value uniqueness"
type Book {
# highlight-next-line
  title: String @index(unique: true)
}
```

:::note
Unique indexes are used under the hood to enforce [one-to-one relationships](collections.md#relationships-one-to-one). The index must not be dropped, or the 1:1 nature of the relationship will not be fulfilled anymore.
:::

## Indexes for multiple fields (composite) {/* #composite */}

To create an index on the combination of multiple fields (composite index), use the `@index` directive at the collection level.

```graphql title="(Unique) Index for (genre, author)"
# highlight-next-line
type Book @index(unique: true, includes: [{ field: "genre" }, { field: "author" }]) {
  genre: String
  author: String
}
```

The order of fields in `includes` defines the structure of the index. An index defined on fields `genre` and `author` will give no performance benefit to queries filtering only on `author`. Think of a composite index storing references to documents in a hierarchical structure defined by its order:

```text
Fiction/David Foster Wallace/docID1
Fiction/David Foster Wallace/docID2
Fiction/George Orwell/docID3
Fiction/George Orwell/docID4
Physics/Richard Feynman/docID5
...
```

Although there is a partial benefit to queries filtering only on `genre`, there is no benefit if a query skips fields.

## JSON fields indexing {/* #json-fields */}

Fields of type `JSON` are treated specially: their leaf nodes are indexed, so that the JSON structure can be traversed in queries. Each JSON field generates multiple entries in the index: one for every leaf node, each with their value and path.
For example, given a JSON property with the following value:

```json
{
  "user": {
    "device": {
      "os": "Linux"
    }
  }
}
```
Assuming an index is present on `Collection.jsonField`, you can query documents of that type filtering on the `user.device.os` property:

```graphql
{
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

## Performance considerations {/* #performance */}

More indexes is not better. The right indexes is better.

Although an index can improve read performance, it will decrease write performance, because every document update/create must also update the relevant indexes.

- Create indexes based on your query patterns. If you are tempted to index every field, remember that there's no free lunch and that the overhead (in storage and write speed) is likely to outweigh the benefit.
- Use unique indexes only when necessary. Because they require extra validation, their performance impact is more significant.
