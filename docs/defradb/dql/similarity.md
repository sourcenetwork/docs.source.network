---
title: Similarity queries
description: Similarity queries allow you to retrieve documents basing on how close a vector field is to a given target vector.
---

The function `SIMILARITY` allows you to retrieve documents basing on how close a vector field is to a given target vector. Similarity queries can be used together with [vector indexes](schema/indexes.md#vector-indexes) and/or [the @embedding directive](schema/embeddings.md), but they don't have to.

<details>
  <summary>Display database setup</summary>
  
  To reproduce the example results from this page, your database needs the following setup.

  ```graphql title="Database schema" test-setup-collection
  type Book {
    title: String!
    plot: String
    about_v: [Float32!] @index(vector: {dimensions: 5})
  }
  ```
  ```graphql title="Documents setup" test-setup-data
  mutation {
    b11:add_Book(input: {
      title: "1984",
      plot: "A masterpiece of rebellion and imprisonment where war is peace, freedom is slavery, and Big Brother is watching.",
      about_v: [1,2,3,4,5]
    }) { _docID title }
    b12:add_Book(input: {
      title: "Down and Out in Paris and London",
      plot: "The adventures of a penniless British writer among the down-and-outs of two great cities.",
      about_v: [2,3,4,5,1]
    }) { _docID title }
    b21:add_Book(input: {
      title: "Lord of the Flies",
      plot: "At the dawn of the next world war, a plane crashes on an uncharted island, stranding a group of schoolboys.",
      about_v: [3,4,5,1,2]
    }) { _docID title }
    b31:add_Book(input: {
      title: "Infinite Jest",
      plot: "A gargantuan, mind-altering tragi-comedy about the Pursuit of Happiness in America.",
      about_v: [4,5,1,2,3]
    }) { _docID title }
    b32:add_Book(input: {
      title: "Consider the Lobster and Other Essays",
      plot: "Do lobsters feel pain? Did Franz Kafka have a funny bone? What is John Updike's deal, anyway? And what happens when adult video starlets meet their fans in person? Essays that are also enthralling narrative adventures.",
      about_v: [5,1,2,3,4]
    }) { _docID title }
    b33:add_Book(input: {
      title: "Girl with Curious Hair",
      plot: "Remarkable and unsettling reimaginations of reality.",
      about_v: [3,1,3,4,1]
    }) { _docID title }
    b41:add_Book(input: {
      title: "Les Misérables",
      plot: "Victor Hugo's tale of injustice, heroism and love follows the fortunes of Jean Valjean, an escaped convict determined to put his criminal past behind him.",
      about_v: [1,2,5,3,2]
    }) { _docID title }
  }
  ```
</details>

## Syntax {/* #syntax */}

```graphql title="Syntax &ndash; SIMILARITY" test-skip
SIMILARITY( 
  field: {
    vector: [Float32!]
  }
}): Float
```
- `field` &ndash; Collection field name on which to run the similarity search.
- `vector` &ndash; Vector value to calculate distance from.

## Examples {/* #examples */}

```graphql title='Retrieve "Book" documents, sorting by how close their field "about_v" is to a given vector'
{
  Book(limit: 3, order: {_alias: {score: DESC}}) {
    title
    about_v
    score: SIMILARITY(about_v: {vector: [1,2,3,4,4]})
  }
}
```
```json result
{
  "data": {
    "Book": [
      {
        "about_v": [
          1,
          2,
          3,
          4,
          5
        ],
        "score": 0.9940534656094302,
        "title": "1984"
      },
      {
        "about_v": [
          1,
          2,
          5,
          3,
          2
        ],
        "score": 0.8993875008265758,
        "title": "Les Misérables"
      },
      {
        "about_v": [
          2,
          3,
          4,
          5,
          1
        ],
        "score": 0.8747670497362986,
        "title": "Down and Out in Paris and London"
      }
    ]
  }
}
```

### Similarity queries and vector indexes {/* #vector-indexes */}

Although similarity queries work on a vector field regardless of whether a [vector index](schema/indexes.md#vector-indexes) is defined on the field, the presence of a vector index greatly improves query performance.
However, even if a vector index is available, a query must satisfy all the following conditions for the index to be used:
1. The number of results is [limited](dql/limit-paginate.md#limit).
2. Results are [sorted](dql/order.md) by similarity score `DESC`.
3. Results are not [filtered](dql/filter.md).

A query not satisfying all such conditions will result in a full collection scan (even if a vector index is available), and a warning with code `VECTOR_INDEX_UNUSED` is returned together with the result.

```graphql title='Similarity query without sorting by similarity score DESC raises a warning'
{
  Book(limit: 1) {
    title
    about_v
    score: SIMILARITY(about_v: {vector: [1,2,3,4,4]})
  }
}
```
```json result
{
  "data": {
    "Book": [
      {
        "about_v": [
          1,
          2,
          3,
          4,
          5
        ],
        "score": 0.9940534656094302,
        "title": "1984"
      }
    ]
  },
  "extensions": {
    "warnings": [
      {
        "code": "VECTOR_INDEX_UNUSED",
        "message": "similarity query on field 'about_v' did not use the vector index and read the whole collection",
        "detail": {
          "field": "about_v",
          "reason": "notOrderedBySimilarityDesc"
        }
      }
    ]
  }
}
```