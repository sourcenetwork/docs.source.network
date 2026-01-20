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

**Performance trade-off:** Indexes improve read performance but add write overhead, as each document update must also update all relevant indexes.

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
Cost: O(log n) for lookup + O(m) for retrieval where m = matching documents
```

### Index structure

DefraDB stores indexes as sorted key-value pairs where:
- **Key**: The indexed field value(s)
- **Value**: Document identifier (_key)

For a User collection with an indexed `name` field:
```
Index entries:
"Alice" → [doc_id_1]
"Bob" → [doc_id_2, doc_id_3]
"Charlie" → [doc_id_4]
```

When you query for `name = "Bob"`, DefraDB looks up "Bob" in the index and immediately retrieves `doc_id_2` and `doc_id_3`.

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
("published", "2024-01-15") → [doc_id_1]
("published", "2024-01-16") → [doc_id_2, doc_id_3]
("draft", "2024-01-15") → [doc_id_4]
```

Composite indexes are efficient for queries like:
```graphql
filter: {
  status: {_eq: "published"}
  publishedAt: {_gt: "2024-01-01"}
}
```

But less efficient for queries filtering only on the second field (`publishedAt` alone).

### Unique indexes

Unique indexes enforce uniqueness constraints at the database level:

```graphql
type User {
  email: String @index(unique: true)
}
```

When you try to create a document with a duplicate email, DefraDB will reject it. This is more efficient than manually checking for duplicates in your application code.

**Performance impact:** Unique indexes add validation overhead because DefraDB must check for existing values before every insert or update.

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

## JSON field indexing

JSON fields present unique indexing challenges because they're hierarchical and semi-structured. DefraDB uses a specialized approach to handle them efficiently.

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

**Index entries created:**
```
["user", "device", "model", "iPhone"] → doc_id_1
["user", "device", "version", "15"] → doc_id_1
["user", "location", "city", "Montreal"] → doc_id_1
```

Each entry includes the full path to the value, ensuring DefraDB knows not just what the value is, but where it exists within the document structure.

### Inverted indexes for JSON

DefraDB uses **inverted indexes** for JSON fields. Traditional indexes map documents to values; inverted indexes map values to documents.

**Traditional index (document → value):**
```
doc_id_1 → {"user": {"device": {"model": "iPhone"}}}
doc_id_2 → {"user": {"device": {"model": "Android"}}}
```

**Inverted index (value → documents):**
```
["user", "device", "model", "iPhone"] → [doc_id_1, doc_id_3, doc_id_7]
["user", "device", "model", "Android"] → [doc_id_2, doc_id_5]
```

When you query for a specific path and value, DefraDB directly looks it up in the inverted index and retrieves all matching documents.

### Value normalization

DefraDB normalizes JSON leaf values to ensure consistent ordering and comparisons:

- **Type normalization**: Numbers are normalized to `int64` or `float64`
- **Path storage**: Each value stores its complete path
- **Sorting consistency**: Normalized values ensure predictable sort order

This normalization allows DefraDB to:
- Compare values across documents reliably
- Sort results consistently
- Filter efficiently regardless of how values were originally stored

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
1. Look up `["user", "device", "model", "iPhone"]` in inverted index
2. Retrieve matching document IDs
3. Return those documents

The indexed approach avoids JSON parsing and navigation during query execution.

### Key format for JSON indexes

DefraDB uses a hierarchical key format for JSON index entries:

```
<collection_id>/<index_id>/<json_path>/<json_value>/<doc_id>
```

Example:
```
users_col/idx_123/user/device/model/iPhone/doc_456
users_col/idx_123/user/location/city/Montreal/doc_789
```

This format allows efficient prefix scanning for partial path matches and supports complex queries on nested JSON structures.

## Performance considerations

### Read vs write trade-off

Every index improves read performance but degrades write performance:

**Reads (queries):**
- Index lookups are O(log n) instead of O(n) table scans
- Queries on indexed fields are significantly faster
- Complex filters benefit from composite indexes

**Writes (inserts/updates):**
- Each indexed field adds overhead to document creation
- Updates require updating the document AND all relevant indexes
- More indexes = slower writes

### When to use indexes

**Good candidates for indexing:**
- Fields frequently used in query filters
- Foreign key relationships queried often
- Fields requiring uniqueness constraints
- Fields used for sorting

**Poor candidates for indexing:**
- Fields rarely or never queried
- Fields that change frequently but are seldom filtered
- High-cardinality fields with mostly unique values (unless uniqueness is required)

### Composite vs multiple single-field indexes

**Composite index:**
```graphql
@index(includes: [{field: "status"}, {field: "date"}])
```

**Multiple single-field indexes:**
```graphql
status: String @index
date: DateTime @index
```

**When to use composite:**
- Queries frequently filter on both fields together
- Order matters (queries filter on status, then date)
- Want optimal performance for that specific query pattern

**When to use multiple single-field:**
- Queries filter on either field independently
- Need flexibility for different query combinations
- Don't mind slightly slower performance for multi-field queries

### Index maintenance overhead

Indexes aren't free:

**Storage:** Each index consumes disk space proportional to the number of documents and indexed field size.

**Memory:** Active indexes may be cached in memory for faster access.

**CPU:** Index updates require computation during writes.

**Balance these costs** against the query performance improvements to determine the optimal indexing strategy.

## Direction and ordering

### Index direction

Indexes can be ordered ascending (ASC) or descending (DESC):

```graphql
type Article {
  publishedAt: DateTime @index(direction: DESC)
}
```

**Why direction matters:**

Descending indexes are optimized for queries that want the most recent items first:
```graphql
Article(order: {publishedAt: DESC}, limit: 10)
```

If your index direction matches your query's sort order, DefraDB can use the index directly without additional sorting.

### Composite index direction

Each field in a composite index can have its own direction:

```graphql
@index(includes: [
  {field: "status", direction: ASC},
  {field: "publishedAt", direction: DESC}
])
```

This optimizes queries that sort by status ascending, then by publishedAt descending.

## Benefits of DefraDB's indexing system

### Efficient queries

Indexes transform slow table scans into fast direct lookups, making queries scale logarithmically instead of linearly with dataset size.

### Precise path tracking (JSON)

JSON indexes maintain full path information, allowing accurate indexing and retrieval of deeply nested structures without ambiguity.

### Scalable structure

DefraDB's indexing system handles:
- Simple scalar fields efficiently
- Complex composite indexes for multi-field queries
- Deeply nested JSON with minimal overhead
- Large datasets with predictable performance characteristics

### Flexible constraints

Unique indexes provide database-level data integrity without requiring application-level validation.

## Limitations and considerations

### Index creation constraints

- Indexes must be defined in the schema; you cannot add them to existing collections without schema migration
- All index definitions must be present when creating the schema
- Changing indexes requires schema migration

### Query pattern dependency

Indexes only help queries that use the indexed fields. If your query patterns change, you may need to adjust your indexing strategy.

### Write amplification

Heavy indexing can significantly slow down write operations. Monitor write performance and adjust indexes if writes become a bottleneck.

### Storage overhead

Large collections with many indexes can consume significant disk space. Plan storage capacity accordingly.
