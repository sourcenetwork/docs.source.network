---
sidebar_label: Secondary Indexes
sidebar_position: 60
---
# Seconday Indexes

## Introduction

DefraDB provides a powerful and flexible secondary indexing system that enables efficient document lookups and queries.

## Usage

The `@index` directive can be used on GraphQL schema objects and field definitions to configure indexes.

```graphql
@index(name: String, unique: Bool, direction: ORDERING, includes: [{ field: String, direction: ORDERING }])
```

### `name` 
Sets the index name. Defaults to concatenated field names with direction.

### `unique` 
Makes the index unique. Defaults to false.

### `direction`
Sets the default index direction for all fields. Can be one of ASC (ascending) or DESC (descending). Defaults to ASC.
		
If a field in the includes list does not specify a direction the default direction from this value will be used instead.

### `includes` 
Sets the fields the index is created on.

When used on a field definition and the field is not in the includes list it will be implicitly added as the first entry.

## Examples

### Field level usage

Creates an index on the User name field with DESC direction.

```graphql
type User {
    name: String @index(direction: DESC)
}
```

### Schema level usage

Creates an index on the User name field with default direction (ASC).

```graphql
type User @index(includes: {field: "name"}) {
    name: String
    age: Int 
}
```

### Unique index

Creates a unique index on the User name field with default direction (ASC).

```graphql
type User {
    name: String @index(unique: true)
}
```

### Composite index

Creates a composite index on the User name and age fields with default direction (ASC).

```graphql
type User @index(includes: [{field: "name"}, {field: "age"}]) {
    name: String
    age: Int 
}
```

### Relationship index

Creates a unique index on the User relationship to Address. The unique index constraint ensures that no two Users can reference the same Address document.

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

## Performance considerations

Indexes can greatly improve query performance, but they also impact system performance during writes. Each index adds write overhead since every document update must also update the relevant indexes. Despite this, the boost in read performance for indexed queries usually makes this trade-off worthwhile.

#### To optimize performance:

- Choose indexes based on your query patterns. Focus on fields frequently used in query filters to maximize efficiency.
- Avoid indexing rarely queried fields. Doing so adds unnecessary overhead.
- Be cautious with unique indexes. These require extra validation, making their performance impact more significant.

Plan your indexes carefully to balance read and write performance.

### Indexing related objects

DefraDB supports indexing relationships between documents, allowing for efficient queries across related data.

#### Example schema: Users and addresses

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

Key indexes in this schema:

- **City field in address:** Indexed to enable efficient queries by city.
- **Relationship between user and address**: Indexed to support fast lookups based on relationships.

#### Query example

The following query retrieves all users living in Montreal:

```graphql
query {
    User(filter: {
        address: {city: {_eq: "Montreal"}}
    }) {
        name
    }
}
```

#### How indexing improves efficiency

**Without indexes:**
- Fetch all user documents.
- For each user, retrieve the corresponding Address. This approach becomes slow with large datasets.

**With indexes:**
- Fetch address documents matching the city value directly.
- Retrieve the corresponding User documents. This method is much faster because indexes enable direct lookups.

### Enforcing unique relationships
Indexes can also enforce one-to-one relationships. For instance, to ensure each User has exactly one unique Address:

```graphql
type User {
    name: String 
    age: Int
    address: Address @primary @index(unique: true)
} 

type Address {
    user: User
    city: String @index
    street: String 
}
```

Here, the @index(unique: true) constraint ensures no two Users can share the same Address. Without it, the relationship defaults to one-to-many, allowing multiple Users to reference a single Address.

By combining relationship indexing with cardinality constraints, you can create highly efficient and logically consistent data structures.

## JSON field indexing

DefraDB offers a specialized indexing system for JSON fields, designed to handle their hierarchical structure efficiently.

### Overview

JSON fields differ from other field types (e.g., Int, String, Bool) because they are semi-structured and encoded. DefraDB uses a path-aware system to manage these complexities, enabling traversal and indexing of all leaf nodes in a JSON document.

### Example

```json
{
    "user": {
        "device": {
            "model": "iPhone"
        }
    }
}
```

Here, the `iPhone` value is represented with its complete path: [`user`, `device`, `model`]. This path-aware representation ensures that the system knows not just the value, but where it resides within the document.

Retrieve documents where the model is "iPhone":

```graphql
query {
    Collection(filter: {
        jsonField: {
            user: {
                device: {
                    model: {_eq: "iPhone"}
                }
            }
        }
    })
}
```

With indexes, the system directly retrieves matching documents, avoiding the need to scan and parse the JSON during queries.

### How it works

#### Inverted Indexes for JSON
DefraDB uses inverted indexes for JSON fields. These indexes reverse the traditional "document-to-value" relationship by starting with a value and quickly locating all documents containing that value.

- Regular fields map to a single index entry.
- JSON fields generate multiple entries—one for each leaf node, incorporating both the path and the value.

During indexing, the system traverses the entire JSON structure, creating these detailed index entries.

#### Value normalization in JSON
DefraDB normalizes JSON leaf values to ensure consistency in ordering and comparisons. For example:

- JSON values include their normalized value and path information.
- Scalar types (e.g., integers) are normalized to a standard type, such as `int64`.

This ensures that operations like filtering and sorting are reliable and efficient.

#### How indexing works
When indexing a document with JSON fields, the system:

1. Traverses the JSON structure using the JSON interface.
1. Generates index entries for every leaf node, combining path and normalized value.
1. Stores entries efficiently, enabling direct querying.

#### Benefits of JSON field indexing
- **Efficient queries**: Leverages inverted indexes for fast lookups, even in deeply nested structures.
- **Precise path tracking**: Maintains path information for accurate indexing and retrieval.
- **Scalable structure**: Handles complex JSON documents with minimal performance overhead.
