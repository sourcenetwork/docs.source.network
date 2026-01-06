---
sidebar_position: 3
title: Time Travelling Queries
description: How to query previous states of documents in DefraDB
---

# Time Travelling Queries

Time travelling queries let you retrieve a document as it appeared at a specific commit. Add a `cid` argument to any query to fetch a historical version.

:::info Key Points
- Add `cid` parameter with the version's Content Identifier to query historical state
- Syntax is identical to regular queries—just add the CID argument
- Works at document level only (related documents not included)
:::

## Prerequisites

- A running DefraDB instance
- The **docID** of the document you want to query
- The **CID** of the version you want to retrieve

---

## Regular Query vs Time Travelling Query

### Regular Query (Current State)

```graphql
query {
  User(docID: "bae-d4303725-7db9-53d2-b324-f3ee44020e52") {
    name
    age
  }
}
```

**Response:**
```json
{
  "data": {
    "User": {
      "name": "Alicia",
      "age": 29
    }
  }
}
```

### Time Travelling Query (Historical State)

Add the `cid` argument to retrieve a specific version:

```graphql
query {
  User(
    docID: "bae-d4303725-7db9-53d2-b324-f3ee44020e52",
    cid: "bafybeieqnthjlvr64aodivtvtwgqelpjjvkmceyz4aqerkk5h23kjoivmu"
  ) {
    name
    age
  }
}
```

**Response:**
```json
{
  "data": {
    "User": {
      "name": "Alice",
      "age": 28
    }
  }
}
```

The document is returned exactly as it existed at the specified commit.

---

## Example: Querying Multiple Versions

Consider a `User` document that has been updated several times:

| Version | CID (truncated) | State |
|---------|-----------------|-------|
| Genesis | `bafyreig...a1b2` | `{ name: "Alice", age: 28 }` |
| Update 1 | `bafyreih...c3d4` | `{ name: "Alice", age: 28, email: "alice@example.com" }` |
| Update 2 | `bafyreij...e5f6` | `{ name: "Alicia", age: 28, email: "alice@example.com" }` |
| Current | `bafyreil...i9j0` | `{ name: "Alicia", age: 29, email: "alicia@example.com" }` |

**Query the genesis state:**
```graphql
query {
  User(
    docID: "bae-d4303725-7db9-53d2-b324-f3ee44020e52",
    cid: "bafyreiga1b2..."
  ) {
    name
    age
  }
}
```

**Query after the name change (Update 2):**
```graphql
query {
  User(
    docID: "bae-d4303725-7db9-53d2-b324-f3ee44020e52",
    cid: "bafyreije5f6..."
  ) {
    name
    age
  }
}
```

---

## Finding Document CIDs

:::caution Information Needed
This section requires additional information about how to retrieve CIDs for a document's history. Please provide:
1. Query or command to list a document's commit history
2. Whether CIDs are returned in mutation responses
3. Example of retrieving available versions
:::

<!-- 
TODO: Add documentation for:
- How to query commit history
- How to list available CIDs for a document
- Whether mutations return the new CID
-->

---

## Limitations

:::warning Important Constraints
- **Document-level only**: Related documents are not automatically included at their historical state
- **Performance**: Queries for versions far back in history take longer to resolve
:::

### Querying Related Documents

If you need historical state for related documents, query each one separately:

```graphql
# Query the book at a specific version
query {
  Book(
    docID: "bae-book-123",
    cid: "bafybook..."
  ) {
    title
    publishedYear
  }
}

# Separately query the author at their corresponding version
query {
  Author(
    docID: "bae-author-456",
    cid: "bafyauthor..."
  ) {
    name
  }
}
```

---

## Best Practices

1. **Store important CIDs** — Keep track of CIDs for versions you may need to audit later

2. **Use for verification** — Time travelling queries are ideal for inspecting document state at specific points in time

3. **Expect variable performance** — Queries for recent versions are faster than queries for versions far back in history

4. **Query related documents separately** — Issue individual time travelling queries for each document using their respective CIDs

---

## Related Resources

- **[Time Travelling Queries Concepts](../Concepts/time-travel.md)** — Understanding update graphs, CIDs, and how queries are resolved
- **[MerkleCRDT](../Concepts/merkle-crdt.md)** — The underlying data model