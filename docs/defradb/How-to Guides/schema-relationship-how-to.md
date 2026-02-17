---
sidebar_label: Schema Relationship
sidebar_position: 10
---


# Schema relationships

This guide provides step-by-step instructions for creating and managing relationships between schemas in DefraDB.

:::tip[Key Points]

DefraDB provides managed relationships where the database automatically handles foreign keys, correlations, and join operations. Developers specify the relationship type (one-to-one or one-to-many) without manually managing keys or join logic.

**Supported relationship types:**

- **One-to-One** – Single reference between documents (specify `@primary` side for efficient queries)
- **One-to-Many** – One document referenced by many (the "many" side is always primary and holds the foreign key)
- **Many-to-Many** – Not supported; use junction tables to connect one-to-many relationships

**Key features:** Type joins replace traditional field joins, querying from primary to secondary is more efficient (point lookup vs. table scan), and filtering works on both parent and related child objects with different semantics.

**Important notes:** All related types must be added simultaneously in the Schema Definition Language (SDL), and documents must be created in specific order (secondary side first, then primary side referencing the secondary document).

**Current limitations:** cannot create related documents in a single mutation, no cascading deletes, and cannot manually define foreign keys and joins.

:::

## Prerequisites

Before following this guide, ensure you have:

- DefraDB installed and running
- Basic understanding of GraphQL schema definitions
- Familiarity with [schema relationship concepts](/defradb/Concepts/schema-relationship)

## One-to-one relationships

One-to-one relationships connect a single document to another single document.

### Define the schema

Create a schema file with both related types. In this example, a user has one address and an address has one user:

```graphql
# schema.graphql

type User {
  name: String
  username: String
  age: Int
  address: Address @primary
}

type Address {
  streetNumber: String
  streetName: String
  country: String
  user: User
}
```

The `@primary` directive designates which side should be queried more frequently for better performance.

**Important**: All related types must be defined together in the same schema file and added in a single operation.

### Add the schema

```bash
defradb client schema add -f schema.graphql
```

DefraDB automatically creates the necessary foreign keys in both types.

### Create documents

Create the secondary side (Address) first, then the primary side (User) with a reference to the Address document.

**Step 1**: Create the Address:

```graphql
mutation {
  create_Address(input: {
    streetNumber: "123"
    streetName: "Test road"
    country: "Canada"
  }) {
    _docID
  }
}
```

Response:

```json
{
  "_docID": "bae-fd541c25-229e-5280-b44b-e5c2af3e374d"
}
```

**Step 2**: Create the User with the Address reference:

```graphql
mutation {
  create_User(input: {
    name: "Alice"
    username: "awesomealice"
    age: 35
    address: { _docID: "bae-fd541c25-229e-5280-b44b-e5c2af3e374d" }
  }) {
    _docID
  }
}
```

### Query relationships

**Query from primary to secondary** (recommended for performance):

```graphql
query {
  User {
    name
    username
    age
    address {
      streetNumber
      streetName
      country
    }
  }
}
```

Querying from the primary side uses an efficient point lookup.

**Query from secondary to primary**:

```graphql
query {
  Address {
    streetNumber
    streetName
    country
    user {
      name
      username
      age
    }
  }
}
```

Querying from the secondary side requires a table scan and is less efficient. See the [Secondary Indexes guide](/defradb/next/How-to Guides/secondary-index) to optimize these queries.

### Filter on related fields

**Filter parent by child field values**:

```graphql
query {
  User(filter: {address: {country: {_eq: "Canada"}}}) {
    name
    username
    age
    address {
      streetNumber
      streetName
      country
    }
  }
}
```

This returns only users whose address is in Canada.

**Filter child within relationship**:

```graphql
query {
  User {
    name
    address(filter: {country: {_eq: "Canada"}}) {
      streetNumber
      streetName
      country
    }
  }
}
```

This returns all users, but only shows addresses matching the filter.

## One-to-many relationships

One-to-many relationships allow one document to be referenced by multiple documents.

### Define the schema

In a one-to-many relationship, the "many" side is automatically the primary side and holds the foreign key:

```graphql
# schema.graphql

type Author {
  name: String
  dateOfBirth: DateTime
  authoredBooks: [Book]
}

type Book {
  name: String
  description: String
  genre: String
  author: Author
}
```

The "many" side (Book) holds the reference to prevent the "one" side (Author) from having an array of IDs.

### Add the schema

```bash
defradb client schema add -f schema.graphql
```

### Create documents

**Step 1**: Create the "one" side (Author):

```graphql
mutation {
  create_Author(input: {
    name: "Saadi"
    dateOfBirth: "1210-07-23T03:46:56.647Z"
  }) {
    _docID
  }
}
```

Response:

```json
{
  "_docID": "bae-0e7c3bb5-4917-5d98-9fcf-b9db369ea6e4"
}
```

**Step 2**: Create related Books with the Author reference:

```graphql
mutation {
  create_Book(input: {
    name: "Gulistan"
    genre: "Poetry"
    author: { _docID: "bae-0e7c3bb5-4917-5d98-9fcf-b9db369ea6e4" }
  }) {
    _docID
  }
}
```

Repeat to create additional books:

```graphql
mutation {
  create_Book(input: {
    name: "Bustan"
    genre: "Poetry"
    author: { _docID: "bae-0e7c3bb5-4917-5d98-9fcf-b9db369ea6e4" }
  }) {
    _docID
  }
}
```

### Update documents

Update the Author:

```graphql
mutation {
  update_Author(
    id: "bae-0e7c3bb5-4917-5d98-9fcf-b9db369ea6e4"
    input: {name: "Saadi Shirazi"}
  ) {
    _docID
  }
}
```

Update a Book using a filter:

```graphql
mutation {
  update_Book(
    filter: {name: {_eq: "Gulistan"}}
    input: {description: "Persian poetry of ideas"}
  ) {
    _docID
  }
}
```

### Query relationships

**Query from "one" to "many"**:

```graphql
query {
  Author {
    name
    dateOfBirth
    authoredBooks {
      name
      genre
      description
    }
  }
}
```

Response:

```json
[
  {
    "name": "Saadi Shirazi",
    "dateOfBirth": "1210-07-23T03:46:56.647Z",
    "authoredBooks": [
      {
        "name": "Gulistan",
        "genre": "Poetry",
        "description": "Persian poetry of ideas"
      },
      {
        "name": "Bustan",
        "genre": "Poetry"
      }
    ]
  }
]
```

**Query from "many" to "one"**:

```graphql
query {
  Book {
    name
    genre
    author {
      name
      dateOfBirth
    }
  }
}
```

### Filter on child collections

**Filter children within the relationship**:

```graphql
query {
  Author {
    name
    dateOfBirth
    authoredBooks(filter: {name: {_eq: "Gulistan"}}) {
      name
      genre
    }
  }
}
```

This returns all authors but only shows books matching the filter.

**Filter parent based on child values**:

```graphql
query {
  Author(filter: {authoredBooks: {name: {_eq: "Gulistan"}}}) {
    name
    dateOfBirth
  }
}
```

This returns only authors who have a book named "Gulistan".

## Many-to-many relationships

DefraDB doesn't currently support many-to-many relationships directly. Use a junction table to connect two one-to-many relationships.

### Define the junction schema

```graphql
type Book {
  name: String
  bookGenres: [BookGenre]
}

type Genre {
  name: String
  genreBooks: [BookGenre]
}

type BookGenre {
  book: Book
  genre: Genre
}
```

### Create the relationships

**Step 1**: Create the base entities:

```graphql
mutation {
  create_Book(input: {name: "The Name of the Wind"}) {
    _docID
  }
}

mutation {
  create_Genre(input: {name: "Fantasy"}) {
    _docID
  }
}

mutation {
  create_Genre(input: {name: "Adventure"}) {
    _docID
  }
}
```

**Step 2**: Create junction entries linking them:

```graphql
mutation {
  create_BookGenre(input: {
    book: { _docID: "bae-book-key" }
    genre: { _docID: "bae-fantasy-key" }
  }) {
    _docID
  }
}

mutation {
  create_BookGenre(input: {
    book: { _docID: "bae-book-key" }
    genre: { _docID: "bae-adventure-key" }
  }) {
    _docID
  }
}
```

### Query many-to-many relationships

```graphql
query {
  Book {
    name
    bookGenres {
      genre {
        name
      }
    }
  }
}
```

## Current limitations

<details>
<summary>Click to view current limitations and future plans</summary>

**Current limitations:**

- **No native many-to-many support**: Must use junction tables
- **Multiple mutations required**: Cannot create related documents in a single mutation
- **No unmanaged relationships**: Cannot manually define foreign keys and joins
- **No cascading deletes**: Deleting one document doesn't automatically delete related documents

**Future improvements:**

- Native many-to-many relationship support
- Single mutation for creating related documents
- Enhanced secondary indexes for improved query performance from secondary to primary
- Potential support for cascading deletes

</details>

## Troubleshooting

### Schema not loading

**Issue**: "Cannot find related type" error when adding schema.

**Solution**: Ensure all related types are defined in the same schema file and added in a single operation.

### Document creation fails

**Issue**: Cannot create documents with relationships.

**Solution**: Create the secondary side (or "one" side in one-to-many) first, then create the primary side referencing the secondary document via the schema's relationship field (e.g., `address: { _docID: "..." }` or `author: { _docID: "..." }`).

### Slow queries

**Issue**: Queries are slow when traversing relationships.

**Solution**: Query from the primary side to the secondary side whenever possible. For one-to-one relationships, use `@primary` on the side you'll query from most. See the [Secondary Indexes guide](/defradb/next/How-to Guides/secondary-index) for optimization strategies.
