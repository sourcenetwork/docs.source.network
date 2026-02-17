---
sidebar_label: Secondary index
sidebar_position: 10
---


# Secondary indexes

This guide provides step-by-step instructions for creating and using secondary indexes in DefraDB to improve query performance.

:::tip[Key Points]

DefraDB's secondary indexing system enables efficient document lookups using the `@index` directive on GraphQL schema fields. Indexes trade write overhead for significantly faster read performance on filtered queries.

**Best practices:** Index frequently filtered fields, avoid indexing rarely queried fields, and use unique indexes sparingly (they add validation overhead). Plan indexes based on query patterns to balance read/write performance.

:::

## Prerequisites

Before following this guide, ensure you have:

- DefraDB installed and running
- A defined schema for your collections
- Understanding of [secondary index concepts](/defradb/next/Concepts/secondary-index)

## Create a basic index

Add the `@index` directive to a field in your schema to create an index.

### Index a single field

```graphql
type User {
  name: String @index
  age: Int
}
```

This creates an ascending (ASC) index on the `name` field.

### Specify index direction

```graphql
type User {
  name: String @index(direction: DESC)
  age: Int
}
```

Use `direction: DESC` for descending order or `direction: ASC` (default) for ascending order.

### Add the schema

```bash
defradb client schema add -f schema.graphql
```

## Create a unique index

Unique indexes ensure no two documents have the same value for the indexed field.

```graphql
type User {
  email: String @index(unique: true)
  name: String
}
```

This prevents duplicate email addresses in your User collection.

## Create a composite index

Composite indexes span multiple fields, useful for queries filtering on multiple fields simultaneously.

### Using schema-level directive

```graphql
type User @index(includes: [{field: "name"}, {field: "age"}]) {
  name: String
  age: Int
  email: String
}
```

### Specify different directions per field

```graphql
type User @index(includes: [
  {field: "name", direction: ASC},
  {field: "age", direction: DESC}
]) {
  name: String
  age: Int
}
```

## Index relationships

Index relationship fields to improve query performance across related documents.

### Basic relationship index

```graphql
type User {
  name: String
  age: Int
  address: Address @primary @index
}

type Address {
  user: User
  city: String @index
  street: String
}
```

This indexes both:
- The relationship between User and Address
- The city field in Address

### Query with relationship index

```graphql
query {
  User(filter: {
    address: {city: {_eq: "Montreal"}}
  }) {
    name
  }
}
```

With the indexes, DefraDB:
1. Quickly finds Address documents with `city = "Montreal"`
2. Retrieves the related User documents efficiently

### Enforce unique relationships

Use a unique index to enforce one-to-one relationships:

```graphql
type User {
  name: String
  age: Int
  address: Address @primary @index(unique: true)
}

type Address {
  user: User
  city: String
  street: String
}
```

This ensures no two Users can reference the same Address document.

## Index JSON fields

DefraDB supports indexing JSON fields for efficient queries on nested data.

### Define a schema with JSON field

```graphql
type Product {
  name: String
  metadata: JSON @index
}
```

### Query nested JSON paths

```graphql
query {
  Product(filter: {
    metadata: {
      user: {
        device: {
          model: {_eq: "iPhone"}
        }
      }
    }
  }) {
    name
  }
}
```

The index enables direct lookup of documents matching the nested path and value.

## Name your indexes

Assign custom names to indexes for easier identification.

```graphql
type User {
  name: String @index(name: "user_name_idx")
  email: String @index(name: "user_email_unique_idx", unique: true)
}
```

Default names are auto-generated from field names and direction.

## Query patterns for best performance

### Index frequently filtered fields

```graphql
type Article {
  title: String
  content: String
  status: String @index  # Frequently filtered
  publishedAt: DateTime @index  # Frequently filtered
  author: String
}
```

Index fields commonly used in `filter` clauses.

### Use composite indexes for multi-field filters

```graphql
type Article @index(includes: [
  {field: "status"},
  {field: "publishedAt"}
]) {
  title: String
  status: String
  publishedAt: DateTime
}
```

```graphql
query {
  Article(filter: {
    status: {_eq: "published"}
    publishedAt: {_gt: "2024-01-01"}
  }) {
    title
  }
}
```

This composite index efficiently handles queries filtering on both fields.

### Avoid over-indexing

Don't index fields that are rarely queried:

```graphql
type User {
  name: String @index  # Good - frequently queried
  email: String @index  # Good - frequently queried
  middleName: String  # No index - rarely queried
  internalNote: String  # No index - rarely queried
}
```

Every index adds write overhead, so only index what you need.

## Performance optimization tips

- **Index your query patterns**: Analyze your application's queries and index the fields used in filters
- **Use unique indexes sparingly**: They add validation overhead on writes
- **Consider composite indexes**: More efficient than multiple single-field indexes for multi-field queries
- **Test query performance**: Use the [explain systems](/defradb/next/How-to%20Guides/explain-systems-how-to) to analyze query execution

## Troubleshooting

### Queries still slow after adding indexes

**Issue**: Query performance hasn't improved after adding indexes.

**Solutions**:
- Verify the index was created successfully
- Ensure your query filter uses the indexed field
- Check if you're querying in the reverse direction of a relationship (may need to index the other side)
- Use composite indexes if filtering on multiple fields

### Unique constraint violations

**Issue**: Cannot insert documents due to unique index constraint.

**Solution**: Check for existing documents with the same value. Unique indexes prevent duplicates, so you must either update the existing document or use a different value.

### Write performance degraded

**Issue**: Document creation/updates are slower after adding indexes.

**Solution**: This is expected behavior. Indexes trade write performance for read performance. Review your indexes and remove any that aren't essential for your query patterns.
