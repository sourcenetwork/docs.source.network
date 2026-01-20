---
sidebar_label: Schema Relationship
sidebar_position: 10
---


# Schema relationships

This guide provides step-by-step instructions for creating and managing relationships between schemas in DefraDB.

:::tip[Key Points]

Lens is DefraDB's bi-directional schema migration engine that transforms data between schema versions without requiring upfront migration of all documents. Built on WebAssembly, it enables language-agnostic transformations executed safely in a sandbox.

**Key features:**

- **Lazy evaluation** – Migrations execute only when documents are read, queried, or updated (no upfront cost)
- **Bi-directional** – Define both forward (`transform`) and reverse (`inverse`) migrations between schema versions
- **Language-agnostic** – Write migrations in any language that compiles to WebAssembly
- **P2P compatible** – Peers on different schema versions can sync seamlessly

**How it works:** Migrations are defined as WebAssembly modules with four functions: `alloc`, `set_param`, `transform`, and optionally `inverse`. Documents are transformed on-demand at query time, allowing rapid toggling between schema versions.

**Trade-offs:** Lazy execution means errors surface at query time rather than migration time, and current performance is secondary to functionality as the system matures.

**Use cases:** Safe schema progression, handling P2P version complexity, A/B testing with on-demand schema selection, and maintaining data consistency across evolving applications.

:::

## Prerequisites

Before following this guide, ensure you have:

- DefraDB installed and running
- Basic understanding of GraphQL schema definitions
- Familiarity with [schema relationship concepts](/defradb/next/Concepts/schema-relationships)

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

Create the secondary side (Address) first, then the primary side (User) with the foreign key reference.

**Step 1**: Create the Address:

```graphql
mutation {
  create_Address(input: {
    streetNumber: "123"
    streetName: "Test road"
    country: "Canada"
  }) {
    _key
  }
}
```

Response:

```json
{
  "_key": "bae-fd541c25-229e-5280-b44b-e5c2af3e374d"
}
```

**Step 2**: Create the User with the Address ID:

```graphql
mutation {
  create_User(input: {
    name: "Alice"
    username: "awesomealice"
    age: 35
    address_id: "bae-fd541c25-229e-5280-b44b-e5c2af3e374d"
  }) {
    _key
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

Querying from the secondary side requires a table scan and is less efficient. See the [Secondary Indexes guide](/defradb/next/How-to%20Guides/secondary-index) to optimize these queries.

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
    _key
  }
}
```

Response:

```json
{
  "_key": "bae-0e7c3bb5-4917-5d98-9fcf-b9db369ea6e4"
}
```

**Step 2**: Create related Books with the Author ID:

```graphql
mutation {
  create_Book(input: {
    name: "Gulistan"
    genre: "Poetry"
    author_id: "bae-0e7c3bb5-4917-5d98-9fcf-b9db369ea6e4"
  }) {
    _key
  }
}
```

Repeat to create additional books:

```graphql
mutation {
  create_Book(input: {
    name: "Bustan"
    genre: "Poetry"
    author_id: "bae-0e7c3bb5-4917-5d98-9fcf-b9db369ea6e4"
  }) {
    _key
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
    _key
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
    _key
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
    _key
  }
}

mutation {
  create_Genre(input: {name: "Fantasy"}) {
    _key
  }
}

mutation {
  create_Genre(input: {name: "Adventure"}) {
    _key
  }
}
```

**Step 2**: Create junction entries linking them:

```graphql
mutation {
  create_BookGenre(input: {
    book_id: "bae-book-key"
    genre_id: "bae-fantasy-key"
  }) {
    _key
  }
}

mutation {
  create_BookGenre(input: {
    book_id: "bae-book-key"
    genre_id: "bae-adventure-key"
  }) {
    _key
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

**Solution**: Create the secondary side (or "one" side in one-to-many) first, then create the primary side with the foreign key reference using the `*_id` field.

### Slow queries

**Issue**: Queries are slow when traversing relationships.

**Solution**: Query from the primary side to the secondary side whenever possible. For one-to-one relationships, use `@primary` on the side you'll query from most. See the [Secondary Indexes guide](/defradb/next/How-to%20Guides/secondary-index) for optimization strategies.
