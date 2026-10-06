---
title: Explore the history of documents (time traveling queries)
---

DefraDB's data model is based on MerkleCRDTs. Each document has a graph of all of its updates, similar to Git. The updates are called `commit`s and are identified by `cid`s (content identifiers). Each commit references its parents by their `cid`s.

<details>
  <summary>Display database setup</summary>

  To reproduce the example results from this page, your database needs the following setup.

  ```graphql title="Database schema" test-setup-collection
  type Person {
    name: String!
    authoredBooks: [Book]
  }

  type Book {
    title: String!
    genre: String
    plot: String
    rating: Float
    author: Person
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
- `depth` &ndash; Position within the chain of commits this one commit is located at.
- `docID` &ndash; ID of document involved in the commits.
- `filter` &ndash; Restrict which commit blocks to retrieve. See [filter](#filter)
- `groupBy` &ndash; Organize returned commits into groups. See [group](#group)
- `limit` &ndash; Maximum number of commits to return.
- `offset` &ndash; Number of commits to skip from the return list (pagination).

{/* Need an extra element after list due to https://github.com/facebook/docusaurus/issues/12583 */}

  </TabItem>
  <TabItem value="commits-obj" label="Commit objects" default>
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
- `height` &ndash; Location of the commit in the DAG. All commits from _add_ operations have a height of `1`;  subsequent local _update_ increments the counter by one for the new commits.
- `links` &ndash; Child commits in the DAG that contribute to the composition of this commit. Linked blocks are at the same depth, and of different types. Composite commits link to the field commits for the fields that the mutation altered; collection commits link to composite commits.
- `signature` &ndash; Commit's signature, if one exists. Used to verify the commit's integrity. See [signature](#signature).

{/* Need an extra element after list due to https://github.com/facebook/docusaurus/issues/12583 */}

  </TabItem>
</Tabs>


## Obtain document commits {/* #obtain-document-commits */}

Create a doc

```
mutation {
  b11:add_Book(input: {
    title: "1984",
    genre: "Dystopia",
    plot: "A masterpiece of rebellion and imprisonment where war is peace, freedom is slavery, and Big Brother is watching."
  }) { _docID title }
}
```
```
{
  "data": {
    "b11": [
      {
        "_docID": "bae-53e80819-b7b4-5fc4-a681-b183b64a8262",
        "title": "1984"
      }
    ]
  }
}
```

retrieve its commits
```
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
    }
  }
```
```
{
  "data": {
    "_commits": [
      {
        "cid": "bafyreib4ouiqmyqdjbtaqbpbcq6u4kifakc4jk5ivvueq7lgwal44wv3my",
        "delta": "aER5c3RvcGlh",
        "fieldName": "genre",
        "height": 1,
        "links": []
      },
      {
        "cid": "bafyreic66sbaqtcnbohw2j2mbqzckcfvih2r6cqi3n4rakocq22kxw6srq",
        "delta": "eHBBIG1hc3RlcnBpZWNlIG9mIHJlYmVsbGlvbiBhbmQgaW1wcmlzb25tZW50IHdoZXJlIHdhciBpcyBwZWFjZSwgZnJlZWRvbSBpcyBzbGF2ZXJ5LCBhbmQgQmlnIEJyb3RoZXIgaXMgd2F0Y2hpbmcu",
        "fieldName": "plot",
        "height": 1,
        "links": []
      },
      {
        "cid": "bafyreiaktcbiphslxp6fy3qicjc4kys4tfcwhechqvoeyfx4waw2knj6ge",
        "delta": "ZDE5ODQ=",
        "fieldName": "title",
        "height": 1,
        "links": []
      },
      {
        "cid": "bafyreiecms7bufflyxthf4ij2h6janohai77oyh4ulbek5jjzef5757wpe",
        "delta": null,
        "fieldName": "_C",
        "height": 1,
        "links": [
          {
            "cid": "bafyreiaktcbiphslxp6fy3qicjc4kys4tfcwhechqvoeyfx4waw2knj6ge",
            "fieldName": "title"
          },
          {
            "cid": "bafyreib4ouiqmyqdjbtaqbpbcq6u4kifakc4jk5ivvueq7lgwal44wv3my",
            "fieldName": "genre"
          },
          {
            "cid": "bafyreic66sbaqtcnbohw2j2mbqzckcfvih2r6cqi3n4rakocq22kxw6srq",
            "fieldName": "plot"
          }
        ]
      }
    ]
  }
}
```

To look at the commits for the first `User` document, let's store its docID in a shell variable:

```shell
FIRST_DOC_ID=$(defradb client query '
  query {
    User(filter: {points: {_geq: 50}}) {
      _docID
      age
      name
      points
    }
  }
' | jq -r '.data.User[0]._docID')

echo "The first _docID is: $FIRST_DOC_ID"
```

To get the most recent commit in the MerkleDAG for this document:

```shell
defradb client query "
  query {
    _commits(docID: \"$FIRST_DOC_ID\") {
      cid
      delta
      height
      links {
        cid
        fieldName
      }
    }
  }
"
```

The list of commits shows, for each,

* `cid` -- The unique identifier
* `delta` -- The base64-encoded content (the commit's payload)
* `height` -- The height of the Merkle DAG at that specific node
* `links` -- Any connection to other entities (`links`)

```json
{
  "data": {
    "_commits": [
      {
        "cid": "bafybeifhtfs6vgu7cwbhkojneh7gghwwinh5xzmf7nqkqqdebw5rqino7u",
        "delta": "pGNhZ2UYH2RuYW1lY0JvYmZwb2ludHMYWmh2ZXJpZmllZPU=",
        "height": 1,
        "links": [
          {
            "cid": "bafybeiet6foxcipesjurdqi4zpsgsiok5znqgw4oa5poef6qtiby5hlpzy",
            "fieldName": "age"
          },
          {
            "cid": "bafybeielahxy3r3ulykwoi5qalvkluojta4jlg6eyxvt7lbon3yd6ignby",
            "fieldName": "name"
          },
          {
            "cid": "bafybeia3tkpz52s3nx4uqadbm7t5tir6gagkvjkgipmxs2xcyzlkf4y4dm",
            "fieldName": "points"
          },
          {
            "cid": "bafybeia4off4javopmxcdyvr6fgb5clo7m5bblxic5sqr2vd52s6khyksm",
            "fieldName": "verified"
          }
        ]
      }
    ]
  }
}
```

You can also obtain a specific commit by its content identifier (`cid`). First let's store the `cid` of the selected user in a shell variable:

```shell
FIRST_CID=$(defradb client query "
  query {
    _commits(docID: \"$FIRST_DOC_ID\") {
      cid
      delta
      height
      links {
        cid
        fieldName
      }
    }
  }
" | jq -r '.data._commits[0].cid')

echo "The first CID is: $FIRST_CID"
```
to obtain the specific commit from this content identifier:

```shell
defradb client query "
  query {
    _commits(cid:\"$FIRST_CID\") {
      cid
      delta
      height
      links {
        cid
        fieldName
      }
    }
  }
"
```
