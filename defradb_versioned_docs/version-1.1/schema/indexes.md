---
title: Indexes
description: The `@index` directive allows you to create indexes on selected properties to speed up data lookup.
---

Indexes allow queries to quickly locate data without having to look through each document in a collection.

By default, every collection has an index on the `_docID` property and on `@primary` [relationship fields](schema/collections.md#relationships).
The `@index` directive allows you to set up further indexes on selected properties when creating a collection.

DefraDB supports two types of indexes:
- **[Ordered indexes](#ordered-indexes)** &ndash; Faster search for one or more document fields.
- **[Vector indexes](#vector-indexes)** &ndash; Similarity queries for vector embeddings.

## Ordered indexes {/* #ordered-indexes */}

### Syntax {/* #ordered-syntax */}

```graphql title="Syntax &ndash; Ordered @index directive"
@index(ordered: {
  name: String,
  unique: Boolean,
  direction: ORDERING,
  includes: [{ field: String, direction: ORDERING }]
})
```
- `name` &ndash; Index name.  
Default: concatenation of _collection name, field names, direction_.
- `unique` &ndash; Enforce uniqueness constraint (i.e. no two documents can have the same value for the given fields).  
Default: `false`.
- `direction` &ndash; Order direction. This affects the default sorting of results when querying documents.  
Valid values: `ASC` or `DESC`.  
Default: `ASC`.
- `includes` &ndash; List of fields the index is created on (not required when the directive is used on a field).

:::tip
The syntax `@index(kind: ordered)` is a shorthand for creating an ordered index with the default values.
:::

### Index single fields {/* #single */}

To create an index for a specific field, use the `@index` directive on the field when creating the collection.

```graphql title='Index the "title" property using default values'
type Book {
  # highlight-next-line
  title: String @index(kind: ordered)
}
```

```graphql title='Index multiple properties, individually, overriding defaults for "name"'
type Book {
  # highlight-next-line
  title: String @index(ordered: {name: "book_title"})
  # highlight-next-line
  plot: String @index(ordered: {name: "book_plot"})
}
```

```graphql title="Index a relationship property"
type Book {
    title: String
    # highlight-next-line
    author: Person @primary @index(kind: ordered)
}

type Person {
    name: String
    books: [Book]
}
```

### Unique indexes {/* #unique */}

An indexed unique field ensures that no two documents have the same value for one field. Multiple documents can have the `null` value for a unique field.

```graphql title="Index the title property and enforce value uniqueness"
type Book {
# highlight-next-line
  title: String @index(ordered: {unique: true})
}
```

:::note
Unique indexes are used under the hood to enforce [one-to-one relationships](collections.md#relationships-one-to-one). The index must not be dropped, or the 1:1 nature of the relationship will not be fulfilled anymore.
:::

### Index multiple fields (composite) {/* #composite */}

To create an index on the combination of multiple fields (composite index), use the `@index` directive at the collection level.

```graphql title="Index for (genre, author)"
# highlight-start
type Book @index(ordered: {
  includes: [{ field: "genre" }, { field: "author" }]
}) {
# highlight-end
  genre: String
  author: String
}
```

The order of fields in `includes` defines the structure of the index. An index defined on fields `genre` and `author` gives no performance benefit to queries filtering only on `author`. Think of a composite index storing references to documents in a hierarchical structure defined by its order:

```text
Fiction/David Foster Wallace/docID1
Fiction/David Foster Wallace/docID2
Fiction/George Orwell/docID3
Fiction/George Orwell/docID4
Physics/Richard Feynman/docID5
...
```

Although there is a partial benefit to queries filtering only on `genre`, there is no benefit if a query skips fields.

### JSON fields {/* #json-fields */}

If a `JSON` field is indexed, queries can traverse the JSON structure and filter by its inner properties. See [Filter documents -> JSON fields](/dql/filter.md#json-fields).

Scalar types (ex. integers) are normalized to DefraDB types (ex. int64).

## Vector indexes {/* #vector-indexes */}

Vector indexes speed up [similarity queries](/dql/similarity.md). You can create vector indexes on fields of type `[Float32!]`. Pairing a vector index with [the `@embedding` directive](embeddings.md) is possible but not required: the index works even if you manually manage the generation of embeddings.

### Syntax {/* #vector-syntax */}

```graphql title="Syntax &ndash; Vector @index directive"
@index(vector: {
  name: String,
  dimensions: Int!,
  alg: String,
  hnsw: {
    metric: String,
    M: Int,
    efConstruction: Int,
    efSearch: Int
  }
})
```
- `name` &ndash; Index name.  
Default: concatenation of _collection name, field name_.
- `dimensions` &ndash; Number of vector entries.
- `alg` &ndash; Algorithm backing the vector index.  
Possible values: `hnsw` (default).
- `hnsw` &ndash; Configuration map if `alg` is `hnsw`.
  - `metric` &ndash; Metric to calculate vector distances.  
  Possible values: `COSINE` (default), `EUCLIDEAN`, `DOT`.
  - `M` &ndash; Maximum number of connections per node. Higher values improve graph quality (recall) at the cost of memory and build time. Default: 16.
  - `efConstruction` &ndash; Build-time exploration factor. Higher values improve graph quality (recall) at the cost of build time. Default: 128.
  - `efSearch` &ndash; Query-time exploration factor. Higher values improve graph quality (recall) at the cost of query latency; can be overridden per query. Default: 64.

### Examples {/* #vector-examples */}

```graphql title="Create a vector index on book title and plot"
type Book {
  title: String!
  plot: String
  about_v: [Float32!] @index(vector: {dimensions: 768, hnsw: {metric: COSINE}})
}
```

## Index operations

### Show indexes

<Tabs groupId="defra">
  <TabItem value="cli" label="CLI" default>
    Display available indexes with the CLI command [`defradb client index list`](/references/cli/defradb_client_index_list.md). You can restrict the list to a specific collection with the optional flag `--collection <name>`.

    ```shell title='List indexes for collection "Book"'
    defradb client index list --collection Book
    ```
  </TabItem>
  <TabItem value="http" label="HTTP API">
    Display all available indexes by submitting a `GET` request to the HTTP endpoint [`/collections/indexes`](/defradb/references/http/api/list-all-indexes/).

    ```http title='List all indexes'
    POST http://localhost:9181/api/v1/collections/indexes HTTP/2
    accept: application/json
    content-type: text/plain
    ```

    To restrict the list to a specific collection, submit a `GET` request to the HTTP endpoint [`/collections/<name>/indexes`](/defradb/references/http/api/list-indexes/).

    ```http title='List indexes for collection "Book"'
    POST http://localhost:9181/api/v1/collections/Book/indexes HTTP/2
    accept: application/json
    content-type: text/plain
    ```
  </TabItem>
</Tabs>

### Delete indexes

<Tabs groupId="defra">
  <TabItem value="cli" label="CLI" default>
    Delete an index with the CLI command [`defradb client index delete`](/references/cli/defradb_client_index_delete.md).

    ```shell title='Delete index "book_plot" from collection "Book"'
    defradb client index delete --name book_plot --collection Book
    ```
  </TabItem>
  <TabItem value="http" label="HTTP API">
    Delete an index by submitting a `DELETE` request to the HTTP endpoint [`/collections/<name>/indexes/<index>`](/defradb/references/http/api/delete-index/).

    ```http title='Delete index "book_plot" from collection "Book"'
    DELETE http://localhost:9181/api/v1/collections/Book/indexes/book_plot HTTP/2
    accept: application/json
    content-type: text/plain
    ```
  </TabItem>
</Tabs>

## Performance considerations {/* #performance */}

More indexes is not better. The right indexes is better.

An index can improve read performance, but it _will_ decrease write performance, because every document update/create must also update the relevant indexes.

- Create indexes based on your query patterns. If you are tempted to index every field, remember that there's no free lunch and that the overhead (in storage and write speed) likely outweighs the benefit.
- Use unique indexes only when necessary. Because they require extra validation, their performance impact is more significant.
