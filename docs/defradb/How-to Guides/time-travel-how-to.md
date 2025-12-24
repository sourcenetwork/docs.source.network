---
sidebar_label: Time Travelling Queries
sidebar_position: 12
---

# How to Use Time Travelling Queries

Time travelling queries let you retrieve a document as it appeared at a specific commit. The query syntax is nearly identical to a regular query—you simply add a CID argument to specify which version you want.

:::tip[Key Points]

Time Traveling Queries let you query documents at any previous state by specifying a commit's Content Identifier (CID). Unlike traditional databases that overwrite data, DefraDB preserves every update in an immutable update graph.

**How to use:** Add a `cid` parameter to your query with the 32-bit hexadecimal version identifier. Works with minimal changes to regular queries – same syntax, just add the CID.

**Key mechanism:** Every document update is stored as a delta payload in a Merkle CRDT update graph. Queries traverse from the target state back to genesis, then replay operations forward to reconstruct the historical state.

**Current limitations:** Cannot traverse relationships to related documents in time-travel mode, and performance degrades with large numbers of updates between genesis and target states.

:::

## Prerequisites

- A running DefraDB instance
- Access to the GraphQL API
- The **docID** of the document you want to query
- The **CID** (Content Identifier) of the version you want to retrieve

## Run a Regular Query

A standard query retrieves the current state of a document:

```graphql
query {
  User(docID: "bae-d4303725-7db9-53d2-b324-f3ee44020e52") {
    name
    age
  }
}
```

This returns the document's present state.

## Run a Time Travelling Query

To query a previous version of the same document, add the **cid** argument with the Content Identifier of the desired version:

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

This query returns the document exactly as it appeared at the commit identified by the given CID. The syntax and behavior are otherwise identical to a normal query.

:::note
**GAP: Additional examples needed.** This section should include:
1. A visual diagram showing the document's update graph and how the query relates to it
2. Example response payloads showing what the returned data looks like
3. An example showing multiple versions of the same document being queried at different CIDs
:::

## Finding a Document's CIDs

:::caution
**GAP: Critical information missing.** The current documentation does not explain how developers obtain the CID values needed for time travelling queries. This section needs to cover:
1. How to query a document's commit history to see available CIDs
2. Whether CIDs are returned in mutation responses when creating/updating documents
3. Example queries or commands for listing available versions
:::

## Limitations

- **Document-level only**: Time travelling queries return only the state of the specific document requested. Related documents (such as an author linked to a book) are not automatically included at their corresponding historical state.

- **Performance varies**: Queries for versions far back in a document's history take longer to resolve, as more updates must be traversed and applied.

## Best Practices

- Use time travelling queries when you need to inspect or verify a specific historical state of a document.
- Keep track of important CIDs for documents you may need to audit later.
- For related data, issue separate time travelling queries for each document using the appropriate CID for each.

## Next Steps

- Review [Time Travelling Queries: Concepts](time-travelling-queries-concepts.md) to understand how the update graph and delta payloads work
- Learn about [Content Identifiers (CIDs)](./cids.md) and how they reference document versions
- Explore the [MerkleCRDT Guide](./merkle-crdt.md) to understand the underlying data model