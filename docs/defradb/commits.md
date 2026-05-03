---
title: Explore the graph of commits
---

## Obtain document commits {/* #obtain-document-commits */}

DefraDB's data model is based on [MerkleCRDTs](https://arxiv.org/pdf/2004.00107.pdf). Each document has a graph of all of its updates, similar to Git. The updates are called `commit`s and are identified by `cid`s (content identifiers). Each commit references its parents by their `cid`s.

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
