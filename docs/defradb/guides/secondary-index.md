---
sidebar_label: Secondary Index Guide
sidebar_position: 80
---

See here for technical reference: https://github.com/sourcenetwork/defradb/blob/develop/client/secondary_indexes.md

## Intro

DefraDB provides a powerful and flexible secondary indexing system that enables efficient document lookups and queries.

## About

### Performance considerations

TODO summarize: https://github.com/sourcenetwork/defradb/blob/develop/client/secondary_indexes.md#performance-considerations

### Indexing related objects

TODO summarize: https://github.com/sourcenetwork/defradb/blob/develop/client/secondary_indexes.md#indexing-related-objects

### JSON field indexing 

TODO summarize: https://github.com/sourcenetwork/defradb/blob/develop/client/secondary_indexes.md#json-field-indexing

## Usage

The `@index` directive can be used on GraphQL schema objects and field definitions to configure indexes.

`@index(name: String, unique: Bool, direction: ORDERING, includes: [{ field: String, direction: ORDERING }])`

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

```gql
type User {
    name: String @index(direction: DESC)
}
```

### Schema level usage

Creates an index on the User name field with default direction (ASC).

```gql
type User @index(includes: {field: "name"}) {
    name: String
    age: Int 
}
```

### Unique index

Creates a unique index on the User name field with default direction (ASC).

```gql
type User {
    name: String @index(unique: true)
}
```

### Composite index

Creates a composite index on the User name and age fields with default direction (ASC).

```gql
type User @index(includes: [{field: "name"}, {field: "age"}]) {
    name: String
    age: Int 
}
```

### Relationship index

Creates a unique index on the User relationship to Address. The unique index constraint ensures that no two Users can reference the same Address document.

```gql
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
