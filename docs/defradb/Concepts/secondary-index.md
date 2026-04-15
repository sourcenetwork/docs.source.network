---
sidebar_label: Secondary index
sidebar_position: 10
---

# Secondary indexes

## Overview

Secondary indexes in DefraDB enable efficient document lookups by creating optimized data structures that map field values to documents. Instead of scanning entire collections, indexes allow DefraDB to quickly locate documents matching specific criteria.

**Key Points**

DefraDB's secondary indexing system uses the `@index` directive on GraphQL schema fields to create indexes that **significantly improve query performance on filtered queries**.

**Core capabilities:**

- **Field-level indexes** – Index individual fields for fast lookups
- **Composite indexes** – Index multiple fields together for complex queries
- **Unique constraints** – Enforce uniqueness at the index level
- **Relationship indexes** – Index foreign key relationships between documents
- **JSON field indexes** – Index nested paths within JSON fields using inverted indexes
- **Array field indexes** – Index values within array fields

**Performance trade-off:** Indexes improve read performance but add write overhead, as each document update must also update all relevant indexes. Indexing arrays and JSON fields can fill up storage quickly with large data.

**Best practices:** Index frequently filtered fields, avoid indexing rarely queried fields, and plan indexes based on your application's query patterns.

## How indexes work

### Basic concept

An index is a data structure that maps field values to document identifiers. Instead of scanning every document in a collection (a "table scan"), DefraDB can use the index to directly locate matching documents.

**Without an index:**

```
Query: Find users with age = 30
Process: Scan all user documents → Check each age field → Return matches
Cost: O(n) where n = total documents
```

**With an index on age:**

```
Query: Find users with age = 30
Process: Look up "30" in age index → Return matching document IDs
Cost: O(1) for lookup + O(m) for retrieval where m = matching documents
```

### Index structure

For regular indexes, DefraDB stores index entries as key-value pairs where the document ID is part of the key and the value is empty:

```
/col_id/ind_id/field_values/_docID → {}
```

For unique indexes, the document ID is stored as the value instead:

```
/col_id/ind_id/field_values → _docID
```

For a User collection with an indexed `name` field, the entries look like:

```
Index entries:
"Alice/doc_id_1" → {}
"Bob/doc_id_2" → {}
"Bob/doc_id_3" → {}
"Charlie/doc_id_4" → {}
```

When you query for `name = "Bob"`, DefraDB looks up "Bob" in the index and retrieves matching documents one by one (e.g., `doc_id_2`, then `doc_id_3`). If a `limit: 1` is applied, only the first match is fetched.

## Index types

### Single-field indexes

The simplest form of index covers a single field:

```graphql
type User {
  name: String @index
  email: String @index(unique: true)
}
```

Each indexed field creates a separate index structure. The `unique: true` parameter adds a constraint ensuring no duplicate values.

### Composite indexes

Composite indexes span multiple fields and are optimized for queries filtering on those fields together:

```graphql
type Article @index(includes: [
  {field: "status"},
  {field: "publishedAt"}
]) {
  status: String
  publishedAt: DateTime
}
```

**Index structure:**

```
published/2024-01-15/doc_id_1 → {}
published/2024-01-16/doc_id_2 → {}
published/2024-01-16/doc_id_3 → {}
draft/2024-01-15/doc_id_4 → {}
```

(Note: `col_id` and `index_id` are always prefixed but omitted here for clarity.)

Composite indexes are efficient for queries like:

```graphql
filter: {
  status: {_eq: "published"}
  publishedAt: {_gt: "2017-07-23T03:46:56-05:00"}
}
```

Queries filtering only on the second field (`publishedAt` alone) will not use this index at all.

### Unique indexes

Unique indexes enforce uniqueness constraints at the database level:

```graphql
type User {
  email: String @index(unique: true)
}
```

When you try to create a document with a duplicate email, DefraDB will reject it. This is more efficient than manually checking for duplicates in your application code.

**Performance impact:** Unique indexes require an additional read operation on every insert or update to check for existing values.

## Relationship indexing

### How relationship indexes work

When you index a relationship field, DefraDB creates an index on the foreign key reference:

```graphql
type User {
  address: Address @primary @index
}

type Address {
  city: String @index
}
```

This creates two indexes:

1. User → Address foreign key index
2. Address city field index

### Query optimization with relationship indexes

Consider this query:

```graphql
User(filter: {address: {city: {_eq: "Montreal"}}})
```

**Without indexes:**

1. Scan all User documents
2. For each User, fetch the related Address
3. Check if city matches "Montreal"
4. Return matching Users

**With indexes:**

1. Look up "Montreal" in the Address city index → Get Address IDs
2. Look up those Address IDs in the User→Address relationship index → Get User IDs
3. Retrieve those User documents

The indexed approach avoids scanning the entire User collection and performs direct lookups instead.

### Enforcing relationship cardinality

Unique relationship indexes enforce one-to-one relationships:

```graphql
type User {
  address: Address @primary @index(unique: true)
}
```

Without the unique constraint, the relationship defaults to one-to-many (multiple Users could reference the same Address). The unique index ensures exactly one User per Address.

Note: 1-to-2-sided relations are automatically constrained by a unique index to enforce the 1-to-1 invariant.

## JSON field indexing

JSON fields present unique indexing challenges because they're hierarchical and semi-structured. DefraDB uses a specialized approach to handle them efficiently.

> **Storage warning:** Indexing JSON fields can consume significant disk space with large data, as every leaf node at every path is indexed separately.

### Path-aware indexing

Unlike scalar fields (String, Int, Bool), JSON fields contain nested structures. DefraDB indexes every leaf node in the JSON tree along with its complete path:

**Example document:**

```json
{
  "user": {
    "device": {
      "model": "iPhone",
      "version": "15"
    },
    "location": {
      "city": "Montreal"
    }
  }
}
```

**Index entries created** (using `/col_id/ind_id/` prefix, JSON path parts separated by `.`):

```
/1/1/user.device.model/iPhone/doc_id_1 → {}
/1/1/user.device.version/15/doc_id_1 → {}
/1/1/user.location.city/Montreal/doc_id_1 → {}
```

Each entry includes the full path to the value, ensuring DefraDB knows not just what the value is, but where it exists within the document structure.

### Inverted indexes for JSON

DefraDB uses **inverted indexes** for JSON fields. The whole idea is to tokenize key-value pairs that form a path, mapping values back to the documents that contain them.

For context, a primary (non-inverted) index might look like:

```
/1/1/iPhone → {"user": {"device": {"model": "iPhone"}}}
```

The inverted secondary index instead maps paths and values to document IDs:

```
/1/1/user.device.model/iPhone/doc_id_1 → {}
/1/1/user.device.model/Android/doc_id_2 → {}
```

When you query for a specific path and value, DefraDB directly looks it up in the inverted index and retrieves all matching documents. For more on inverted indexes, see the [CockroachDB RFC on inverted indexes](https://github.com/cockroachdb/cockroach/blob/master/docs/RFCS/20171020_inverted_indexes.md).

### Query execution with JSON indexes

**Query:**

```graphql
Collection(filter: {
  jsonField: {
    user: {
      device: {
        model: {_eq: "iPhone"}
      }
    }
  }
})
```

**Without index:**

1. Scan all documents
2. Parse each JSON field
3. Navigate to `user.device.model`
4. Compare value to "iPhone"
5. Return matches

**With index:**

1. Look up `/user.device.model/iPhone` in inverted index
2. Retrieve matching document IDs
3. Return those documents

The indexed approach avoids JSON parsing and navigation during query execution.

### Key format for JSON indexes

DefraDB uses a hierarchical key format for JSON index entries:

```
<collection_id>/<index_id>/<json_path>/<json_value>/<doc_id>
```

Example (using numeric collection ID `1` and index ID `1`):

```
/1/1/user.device.model/iPhone/doc_id_1
/1/1/user.location.city/Montreal/doc_id_1
```

This format allows efficient prefix scanning for partial path matches and supports complex queries on nested JSON structures.

## Performance considerations

### Read vs write trade-off

Every index improves read performance but adds write overhead. On reads, an `_eq` filter on an indexed field is O(1) for the lookup, plus O(m) to retrieve the m matching documents. On writes, each indexed field requires updating the index in addition to the document itself — so more indexes means slower writes.

### When to use indexes

Fields that are frequently used in query filters, foreign key relationships, or uniqueness constraints are good candidates. Fields that are rarely queried, change frequently without being filtered, or are in large JSON/array structures with big data volumes are generally poor candidates.

### Composite vs multiple single-field indexes

A composite index like `@index(includes: [{field: "status"}, {field: "date"}])` is best when queries regularly filter on both fields together. Multiple single-field indexes offer more flexibility when queries filter on either field independently, at the cost of slightly slower multi-field queries.

## Direction and ordering

Index direction (ASC or DESC) plays a significant role primarily for **composite indexes**. For single-field indexes, the index fetcher can traverse entries in reverse order just as efficiently as the default order, so direction has minimal practical impact there.

For composite indexes, specifying direction can matter:

```graphql
type Article {
  publishedAt: DateTime @index(direction: DESC)
}
```

Each field in a composite index can have its own direction:

```graphql
@index(includes: [
  {field: "status", direction: ASC},
  {field: "publishedAt", direction: DESC}
])
```

When the index direction matches the query's sort order, DefraDB can use the index directly without a separate sorting step.

## Managing indexes

Indexes can be added or deleted at any time using CLI commands or the embedded client. GraphQL-based index management is not yet available.

Refer to the CLI reference for commands to create and drop indexes on existing collections.

## Limitations and considerations

### Query pattern dependency

Indexes only help queries that use the indexed fields. If your query patterns change, you may need to adjust your indexing strategy.

### Write amplification

Heavy indexing can significantly slow down write operations. Monitor write performance and adjust your indexing strategy if writes become a bottleneck.

### Storage overhead

Large collections with many indexes — especially on JSON or array fields — can consume significant disk space. Plan storage capacity accordingly.
