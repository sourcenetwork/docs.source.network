---
title: Explore the history of documents (time traveling queries)
---

DefraDB's data model is based on MerkleCRDTs. Each document has a graph of all of its updates, similar to Git. The updates are called `commit`s and are identified by `cid`s (content identifiers). Each commit references its parents by their `cid`s.

<details>
  <summary>Display database setup</summary>

  To reproduce the example results from this page, your database needs the following setup.

  ```graphql title="Database schema" test-setup-collection
  type Book {
    title: String!
    genre: String
    plot: String
  }
  ```
</details>

## Syntax

<Tabs groupId="commits-syntax">
  <TabItem value="commits-query" label="_commits query" default>
```graphql
query {
  _commits(
    docID: ID, cid: [ID], filter: CommitsFilterArg, depth: Int, limit: Int, offset: Int,
    collectionVersionId: String, order: [commitsOrderArg], groupBy: [commitFields]
  ) [Commit]
}
```

- `cid` &ndash; Unique identifier of one (or more) commit.
- `collectionVersionId` &ndash; ID of the collection version that the commit targeted. Allows you to determine the state of the data model when the change was committed.
- `depth` &ndash; Position within the chain of commits this one commit is located at (counting from the latest commit). Commits at levels _up to_ the given depth are included.
- `docID` &ndash; ID of document involved in the commits.
- `filter` &ndash; Restrict which commit blocks to retrieve. See [filter](#filter)
- `groupBy` &ndash; Organize returned commits into groups. See [DQL -> Group results](./dql/group.md) for usage.
- `limit` &ndash; Maximum number of commits to return.
- `offset` &ndash; Number of commits to skip from the return list (pagination).

{/* Need an extra element after list due to https://github.com/facebook/docusaurus/issues/12583 */}

  </TabItem>
  <TabItem value="commits-obj" label="Commit object" default>
```graphql
type Commit {
  docID: ID
  cid: ID
  delta: String
  height: Int
  fieldName: String
  collectionVersionId: String
  links(docID, cid, filter, groupBy, order): [Commit]
  heads(docID, cid, filter, groupBy, order): [Commit]
  signature: Signature
}
```

- `cid` &ndash; Unique identifier of a commit.
- `collectionVersionId` &ndash; ID of the [collection](./schema/collections.md) version that the commit targeted. Determines the state of the data model when the change was committed.
- `docID` &ndash; ID of document involved in the commits.
- `delta` &ndash; base64 encoded CBOR payload value (the _content_ of the commit).
- `fieldName` &ndash; Name of the field that this commit was committed against. The value is `"_C"` for composite blocks and null for collection blocks.
- `heads` &ndash; Parent commits in the DAG that build the history of this piece of data. Linked blocks are at different depths, and of the same type.
- `height` &ndash; Location of the commit in the DAG (counting from the root commit). All commits from _add_ operations have a height of `1`;  subsequent local _update_ increments the counter by one for the new commits.
- `links` &ndash; Child commits in the DAG that contribute to the composition of this commit. Linked blocks are at the same depth, and of different types. Composite commits link to the field commits for the fields that the mutation altered; collection commits link to composite commits.
- `signature` &ndash; Commit's signature, if one exists. Used to verify the commit's integrity. See [signature](#signature).

{/* Need an extra element after list due to https://github.com/facebook/docusaurus/issues/12583 */}

  </TabItem>
</Tabs>


## Document commits on creation {/* #obtain-document-commits */}

Create a doc

```graphql
mutation {
  add_Book(input: {
    title: "1984",
    plot: "A masterpiece of rebellion and imprisonment where war is peace, freedom is slavery, and Big Brother is watching."
  }) { _docID title }
}
```
```json result
{
  "data": {
    "add_Book": [
      {
        "_docID": "bae-53e80819-b7b4-5fc4-a681-b183b64a8262",
        "title": "1984"
      }
    ]
  }
}
```

To retrieve the commits that resulted from the document creation, use a `_commits` query with the ID of the document.

In this case, there are three commit blocks: two are for the individual fields `title` and `plot`; the third is the composite (`_C`) block, which references the field blocks through the `links` list. You can think of the composite block as a directory containing files. Each commit is uniquely identified by its `cid` field, with the `delta` field containing the data payload that was saved into the storage. In this first layer, all blocks are signed by the identity which submitted the query (see [signature](#signature)).

```graphql
query {
  _commits(docID: "bae-53e80819-b7b4-5fc4-a681-b183b64a8262") {
    fieldName
    cid
    delta
    height
    links {
      cid
      fieldName
    }
    heads {
      cid
      fieldName
    }
    signature {
      identity
      type
      value
    }
  }
}
```
```json result
{
  "data": {
    "_commits": [
      {
        "cid": "bafyreigfmpvezc4efqf27qjlmdvhoiewjbzzfhbphrjcbn5np3azgys3pa",
        "delta": "eHBBIG1hc3RlcnBpZWNlIG9mIHJlYmVsbGlvbiBhbmQgaW1wcmlzb25tZW50IHdoZXJlIHdhciBpcyBwZWFjZSwgZnJlZWRvbSBpcyBzbGF2ZXJ5LCBhbmQgQmlnIEJyb3RoZXIgaXMgd2F0Y2hpbmcu",
        // highlight-next-line
        "fieldName": "plot",
        "heads": [],
        "height": 1,
        "links": [],
        "signature": {
          "identity": "023531430d1053f4eeab4bf520522186698d7e16d53cf0e80df35a158c7a74261e",
          "type": "ES256K",
          "value": "MEUCIQDd0qjbTLAWH2egv3qMKE7afW8O/Ki1Wgum2bwBP/ziHAIgBBtDcYgqdBCUs1P+pV2ZYr/awSd10FkXiGCPKCDk944="
        }
      },
      {
        "cid": "bafyreifeswomzh7doh34t6pcukrktrf4vimazuf32uywrststovczq45ua",
        "delta": "ZDE5ODQ=",
        // highlight-next-line
        "fieldName": "title",
        "heads": [],
        "height": 1,
        "links": [],
        "signature": {
          "identity": "023531430d1053f4eeab4bf520522186698d7e16d53cf0e80df35a158c7a74261e",
          "type": "ES256K",
          "value": "MEUCIQD+lDOW0s823sHqR0BSOTXirlQNAqgsE1nHf2EIgNaLdAIgQ/K+kUExpeu8B9He1Mt2mS4dJB8Qu+Ux07/Xg9Ce6CE="
        }
      },
      {
        "cid": "bafyreidgr7rwyheskxqrmm6lwfacgc7vbiukenv2ppah562avd25rljkcu",
        "delta": null,
        // highlight-next-line
        "fieldName": "_C",
        "heads": [],
        "height": 1,
        "links": [
          {
            "cid": "bafyreifeswomzh7doh34t6pcukrktrf4vimazuf32uywrststovczq45ua",
            "fieldName": "title"
          },
          {
            "cid": "bafyreigfmpvezc4efqf27qjlmdvhoiewjbzzfhbphrjcbn5np3azgys3pa",
            "fieldName": "plot"
          },
        ],
        "signature": {
          "identity": "023531430d1053f4eeab4bf520522186698d7e16d53cf0e80df35a158c7a74261e",
          "type": "ES256K",
          "value": "MEQCIF+kaBWv+EBm4148UXrAmDICrMqBOe0fsaVedfG4ugZBAiA8VenGRQdlp8oGqr+0pZ90VhgDgRwG5mnNY0KRc237LA=="
        }
      }
    ]
  }
}
```

## Document commits on update {/* #obtain-document-commits */}

When a document is updated or deleted, its commits blocks are not updated. Written commits remain unaltered (unless the document is [truncated](./dql/mutation-delete.md#truncate), in which case all corresponding blocks are removed) and _more commits_ are appended to the old ones, creating a history of changes that leads to the present moment. These commit blocks create a _Direct Acyclic Graph (DAG)_. The latest version of each document is cached, so the database never has to read through the history chain to build the present version of the the data: the latest version is just the tip of such history.

Update the previous document, adding a value for the field `genre`.

```graphql
mutation {
  update_Book(
    docID: "bae-53e80819-b7b4-5fc4-a681-b183b64a8262",
    input: {
      genre: "Dystopia"
    }
  ) { _docID title }
}
```
```json result
{
  "data": {
    "add_Book": [
      {
        "_docID": "bae-53e80819-b7b4-5fc4-a681-b183b64a8262",
        "title": "1984"
      }
    ]
  }
}
```

To retrieve the commits resulting from the update mutation, pick the latest composite and fetch its linked blocks. The result shows the field block for `genre` connected to the returned top composite block, and the previous composite block in the history referenced in the `heads` list. 

Blocks for the same field name at different heights build a history chain via their `heads`, each new one referencing the previous one via its `cid`. Because the `cid` is a cryptograhically secure value (the hash of the whole block), the structure of the chain guarantees data integrity by itself: if any part of the data was tampered, the history chain would become invalid.

```
query {
  _commits(
    docID: "bae-1da55608-e747-572b-8271-2ef35b66520d", 
    filter: { fieldName: { _eq: "_C" } },
    depth: 1
  ) {
    fieldName
    cid
    height
    links {
      cid
      fieldName
      delta
    }
    heads {
      cid
      fieldName
    }
  }
}
```
```json result
{
  "data": {
    "_commits": [
      {
        "cid": "bafyreidapjfuskkddbuu5eevkf5usgv6biot7dqlmxau7g5copqr2ax6ha",
        "fieldName": "_C",
        "heads": [
          {
            "cid": "bafyreidgr7rwyheskxqrmm6lwfacgc7vbiukenv2ppah562avd25rljkcu",
            "fieldName": "_C"
          }
        ],
        "height": 2,
        "links": [
          {
            "cid": "bafyreihqf7xoxfeqpukhzlrat3quh6qajm7zjbkvrrqvbw6poaohhqdow4",
            "delta": "aER5c3RvcGlh",
            "fieldName": "genre"
          }
        ]
      }
    ]
  }
}
```

:::tip
The example above queries for the top composite blocks and fetches its links.
However, wishing to inspect commits generated from the latest update, it can feel natural to query for commits at `depth: 1`. 

```graphql
query {
  _commits(docID: "bae-1da55608-e747-572b-8271-2ef35b66520d", depth: 1) {
    fieldName
    height
  }
}
```
```json result
{
  "data": {
    "_commits": [
      {
        "fieldName": "genre",
        "height": 2
      },
      {
        "fieldName": "plot",
        "height": 1
      },
      {
        "fieldName": "title",
        "height": 1
      },
      {
        "fieldName": "_C",
        "height": 2
      }
    ]
  }
}
```

This type of query makes sense to get a view of the latest state of the document, as it returns the top layer for blocks of all types, regardless of their `height` value. 

In the example, `genre` was updated in the second query and has `height: 2` (corresponding to `depth: 1`). On the other hand, `title` and `plot` were not changed in the second query and have `height: 1`, and they are surfaced when querying for `depth: 1` because there are no blocks on top of them.
:::

:::note
at height > 1, only composites are signed. field blocks are signed at height 1 only to seed entropy for cids, but not needed cryptographically.
:::