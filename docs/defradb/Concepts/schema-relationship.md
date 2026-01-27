---
sidebar_label: Schema Relationship
sidebar_position: 10
---


# Schema relationships

## Overview

Schema relationships define how different document types connect and reference each other in DefraDB. Unlike traditional databases where you manually manage foreign keys and joins, DefraDB provides managed relationships that automatically handle the correlation between documents.

## Key points

DefraDB uses **managed relationships** where the database automatically handles foreign keys, correlations, and join operations. You specify the relationship type, and DefraDB manages the implementation details.
**Supported relationship types:**

- **One-to-one** – Single reference between documents (use `@primary` to designate the frequently queried side)
- **One-to-many** – One document referenced by many (the "many" side automatically becomes primary)
- **Many-to-many** – Not natively supported; use junction tables to connect one-to-many relationships

**Key characteristics:**

- Type joins replace traditional field joins
- All related types must be added simultaneously in a single schema operation
- Documents must be created in specific order (secondary → primary)
- Querying from primary to secondary is more efficient (point lookup vs table scan)

**Current limitations:**

- Cannot create related documents in a single mutation
- No cascading deletes
- No unmanaged relationships (cannot manually define foreign keys)

## Relationship types

### One-to-one relationships

A one-to-one relationship connects a single document to another single document, and vice versa. For example, a user has one address, and an address belongs to one user.

In DefraDB, you designate one side as primary using the `@primary` directive. This designation should reflect which direction you'll query more frequently, as querying from primary to secondary is more efficient.

**Example structure:**

```
User ←→ Address
```

Where:

- User is the primary side (designated with `@primary`)
- Address is the secondary side
- Each user has exactly one address
- Each address belongs to exactly one user

### One-to-many relationships

A one-to-many relationship allows one document to be referenced by multiple documents. For example, an author can write many books, but each book has only one author.

In one-to-many relationships, DefraDB automatically makes the "many" side the primary side. This is an important design decision: the "many" side holds the foreign key to prevent the "one" side from storing an array of IDs, which would complicate the structure and break database normalization.

**Example structure:**

```
Author ←→ [Book, Book, Book]
```

Where:

- Book is the primary side (automatically)
- Author is the secondary side
- Each book references one author
- Each author can have many books

### Many-to-many relationships

Many-to-many relationships allow multiple documents on one side to relate to multiple documents on the other side. For example, books can have multiple genres, and genres can apply to multiple books.

DefraDB doesn't natively support many-to-many relationships due to the complexity of implementing them with content-identifiable, self-verifying data structures. However, you can implement many-to-many relationships using a junction table (also called a join table or bridge table).

**Example structure with junction table:**

```
Book ←→ [BookGenre] ←→ Genre
```

Where:

- BookGenre is the junction table
- Book connects to many BookGenre entries
- Genre connects to many BookGenre entries
- This creates an effective many-to-many relationship between Book and Genre

## Managed vs unmanaged relationships

DefraDB exclusively supports **managed relationships**, meaning the database handles the implementation details:

**What DefraDB manages automatically:**

- Foreign key fields
- Correlation between primary and foreign keys
- Join operations (using type joins)
- Which side holds the foreign key reference

**What you control:**

- Relationship type (one-to-one, one-to-many)
- Primary side designation (for one-to-one only)
- Schema structure and field definitions

**What managed relationships provide:**

Unlike unmanaged relationships (common in SQL databases where you manually define foreign keys and joins), managed relationships use **type joins** instead of field joins. This means you don't specify which field on which table correlates to which field on another table—DefraDB handles this automatically based on the relationship type.

## Query efficiency and direction

Understanding query direction is crucial for performance in DefraDB.

### Primary to secondary (efficient)

Querying from the primary side to the secondary side uses a **point lookup**—an efficient operation that directly retrieves the related document without scanning the collection.

**Example:**

```
User (primary) → Address (secondary)
```

This is fast because the User document contains the foreign key to the specific Address.

### Secondary to primary (less efficient)

Querying from the secondary side to the primary side requires a **table scan**—the database must search through the collection to find documents with matching foreign keys.

**Example:**

```
Address (secondary) → User (primary)
```

This is slower because the database must scan the User collection to find which user references this address.

### Optimization strategies

- Use the `@primary` directive on the side you'll query from most frequently
- Consider adding [secondary indexes](/defradb/next/How-to%20Guides/secondary-index) to improve reverse-direction queries
- Structure your schema based on your application's query patterns

## Filtering semantics

DefraDB supports filtering at different levels of relationships, with different behaviors for each.

### Filtering on parent objects

When you filter on the parent object based on child field values, DefraDB returns only parent documents whose children match the filter.

**Example:**

```graphql
Author(filter: {authoredBooks: {genre: {_eq: "Poetry"}}})
```

Returns only authors who have at least one poetry book.

### Filtering on child objects

When you filter on the child relationship field, DefraDB returns all parent documents but only shows child documents that match the filter.

**Example:**

```graphql
Author {
  authoredBooks(filter: {genre: {_eq: "Poetry"}})
}
```

Returns all authors, but only shows their poetry books.

## Content-addressable considerations

DefraDB's content-addressable structure creates unique requirements for relationship management.

### Document creation order

Documents must be created in a specific order because DefraDB uses content identifiers (CIDs) as primary keys. Unlike traditional databases with auto-incrementing integers or UUIDs, DefraDB's document keys are derived from the document content itself.

This creates a causality constraint: you must create the referenced document before creating the document that references it.

**For one-to-one:**

1. Create the secondary side
2. Create the primary side with the secondary's ID

**For one-to-many:**

1. Create the "one" side
2. Create each "many" side document with the "one" side's ID

### Self-describing documents

DefraDB documents are self-describing and self-authenticated through Merkle structures. This affects how relationships work:

- Each document's identity is cryptographically derived from its content
- Relationships are established through these content-based identifiers
- Changes to a document create a new version in the Merkle DAG
- The immutable history of all changes is preserved

## Why many-to-many is not supported

DefraDB currently doesn't support native many-to-many relationships due to several technical challenges related to its content-addressable architecture:

**Complexity with self-verifying structures:**

Creating a many-to-many relationship requires implicit intermediary data (the junction table). In traditional databases, this is straightforward, but in DefraDB's self-describing, self-authenticated data structure, managing this implicit data becomes complex.

**Privacy and ownership verification:**

DefraDB emphasizes privacy-preserving and ownership-verifiable data. Many-to-many relationships create shared state that complicates these guarantees. When multiple documents reference each other, determining ownership and access control becomes more complex.

**Workaround:**

The junction table pattern provides a clear, explicit way to model many-to-many relationships while maintaining DefraDB's security and verification properties. Each relationship becomes an explicit document with its own identity and access control.

## Current limitations

### No single-mutation creation

Currently, you cannot create related documents in a single mutation. Each document requires a separate mutation, and they must be created in the correct order.

**Future improvement:** DefraDB plans to support creating related documents in a single operation.

### No cascading deletes

Deleting a document doesn't automatically delete its related documents. You must manually delete related documents if needed.

**Future consideration:** Cascading deletes may be added in a future version, allowing you to define automatic deletion of related documents.

### No unmanaged relationships

You cannot manually define foreign keys or custom join operations. All relationships must use DefraDB's managed relationship system.

**Design choice:** This limitation is intentional to maintain the integrity of DefraDB's content-addressable structure and automatic verification systems.

## Future development

DefraDB's relationship system continues to evolve:

**Planned improvements:**

- Native many-to-many relationship support
- Single-mutation creation of related documents
- Enhanced secondary indexes for improved query performance in both directions
- Potential support for cascading deletes

**Under consideration:**

- Unmanaged relationship support with explicit foreign key definitions
- Bidirectional relationship performance parity through advanced indexing

These improvements will make relationship management more flexible while maintaining DefraDB's core principles of security, verifiability, and decentralization.
