---
title: Profile and explain queries
---

This guide shows you how to run Explain requests in DefraDB to understand query execution and identify optimization opportunities.

<details>
  <summary>Display database setup</summary>

  To reproduce the example results from this page, your database needs the following setup.

    ```graphql title="Database schema" test-setup-collection
  type Book {
    title: String!
    genre: String
    plot: String
    rating: Float
    ratings: [Float]
    author: Person
    seller: Company
  }
  
  type Person {
    name: String!
    authoredBooks: [Book]
  }

  type Company {
    name: String!
    sells: [Book]
  }
  ```
  ```graphql title="Documents setup" test-setup-data
  mutation {
    a1:add_Person(input: {
      name: "George Orwell"
    }) { _docID name }
    a2:add_Person(input: {
      name: "William Golding"
    }) { _docID name }
    a3:add_Person(input: {
      name: "David Foster Wallace"
    }) { _docID name }
    a4:add_Person(input: {
      name: "Victor Hugo"
    }) { _docID name }

    c1:add_Company(input: {
      name: "The Independent Hipster Bookshop"
    }) { _docID name }
    c2:add_Company(input: {
      name: "The World-Destroying Large Chain"
    }) { _docID name }
  
    b11:add_Book(input: {
      title: "1984",
      genre: "Fiction",
      plot: "A masterpiece of rebellion and imprisonment where war is peace, freedom is slavery, and Big Brother is watching.",
      rating: 4.20,
      ratings: [3.8, 4.91, 3.1, 2.8],
      _authorID: "bae-bc532931-4843-50bc-bbdd-3e31549c8cc6",
      _sellerID: "bae-a5300933-fb0a-5b8f-b38e-202565993ff0"
    }) { _docID title }
    b12:add_Book(input: {
      title: "Down and Out in Paris and London",
      genre: "Memoir",
      plot: "The adventures of a penniless British writer among the down-and-outs of two great cities.",
      rating: 4.09,
      _authorID: "bae-bc532931-4843-50bc-bbdd-3e31549c8cc6",
      _sellerID: "bae-a5300933-fb0a-5b8f-b38e-202565993ff0"
    }) { _docID title }
    b21:add_Book(input: {
      title: "Lord of the Flies",
      genre: "Fiction",
      plot: "At the dawn of the next world war, a plane crashes on an uncharted island, stranding a group of schoolboys.",
      rating: 3.70,
      _authorID: "bae-6025af65-e57e-5db5-84dd-d349b130c6d9",
      _sellerID: "bae-a5300933-fb0a-5b8f-b38e-202565993ff0"
    }) { _docID title }
    b31:add_Book(input: {
      title: "Infinite Jest",
      genre: "Fiction",
      plot: "A gargantuan, mind-altering tragi-comedy about the Pursuit of Happiness in America.",
      rating: 4.25,
      ratings: [3.1, 4.1, 4.5],
      _authorID: "bae-26c791a7-fa81-5d86-95c5-4119e2fef915",
      _sellerID: "bae-81d5fadb-c2a3-5d95-b235-a220c220bf79"
    }) { _docID title }
    b32:add_Book(input: {
      title: "Consider the Lobster and Other Essays",
      genre: "Nonfiction",
      plot: "Do lobsters feel pain? Did Franz Kafka have a funny bone? What is John Updike's deal, anyway? And what happens when adult video starlets meet their fans in person? Essays that are also enthralling narrative adventures.",
      rating: 4.18,
      _authorID: "bae-26c791a7-fa81-5d86-95c5-4119e2fef915",
      _sellerID: "bae-81d5fadb-c2a3-5d95-b235-a220c220bf79"
    }) { _docID title }
    b33:add_Book(input: {
      title: "Girl with Curious Hair",
      genre: "Fiction",
      plot: "Remarkable and unsettling reimaginations of reality.",
      rating: 3.85,
      _authorID: "bae-26c791a7-fa81-5d86-95c5-4119e2fef915",
      _sellerID: "bae-81d5fadb-c2a3-5d95-b235-a220c220bf79"
    }) { _docID title }
    b41:add_Book(input: {
      title: "Les Misérables",
      genre: "Fiction",
      plot: "Victor Hugo's tale of injustice, heroism and love follows the fortunes of Jean Valjean, an escaped convict determined to put his criminal past behind him.",
      rating: 4.21,
      ratings: [3.9, 4.1],
      _authorID: "bae-4bfe5f4c-d668-5dc3-9de2-eb598af3da7d",
      _sellerID: "bae-81d5fadb-c2a3-5d95-b235-a220c220bf79"
    }) { _docID title }
  }
  ```
</details>

## Bare operators list (`@explain(type: debug)`) {/* #explain-debug */}

With the `@explain(type: debug)` directive, the query is **not** executed, and the list of operators that the database would use to execute it is returned as output. Each operator is wrapped in an object, with the operator's name as sole output for each.

Operators in the explain result are nested such that the outer-most operator is executed last, while the inner-most operator is the query's entrypoint. In the example below, `scanNode` is the first operation the database executes, whereas `selectTopNode` is the last one. The nesting reflects the order in which operators run.

```graphql title='Explain (type: debug) query with filter, order, limit clauses'
query @explain(type: debug) {
  Book(
    filter: { plot: { _like: "%love%" } },
    order: { plot: ASC },
    limit: 1
  ) {
    title
  }
}
```
```json result
{
  "data": {
    "explain": {
      "operationNode": [
        {
          "selectTopNode": {
            "limitNode": {
              "orderNode": {
                "selectNode": {
                  "scanNode": {}
                }
              }
            }
          }
        }
      ]
    }
  }
}
```

:::tip
`operationNode` is always the top level node for operations with one or more child selections, such as queries or mutations.
:::

## Detailed operators list (`@explain(type: simple)`) {/* #explain-simple */}

With the `@explain(type: simple)` directive, the query is **not** executed, and the list of operators that the database would use to execute it is returned as output. Each operator object contains its name and all the information relevant for query planning.

```graphql title='Explain (type: simple) query with filter, order, limit clauses'
query @explain(type: simple) {
  Book(
    filter: { title: { _eq: "1984" } },
      limit: 3,
      order: { title: ASC }
  ) {
    title   
  }
}
```
```json result
{
  "data": {
    "explain": {
      "operationNode": [
        {
          "selectTopNode": {
            "limitNode": {
              "limit": 3,
              "offset": 0,
              "selectNode": {
                "docID": null,
                "filter": null,
                "scanNode": {
                  "collectionID": "bafyreidtmanygfdkfs6y56vt4ibztix6zwxrpek6qssnhmlvgd56vg7onm",
                  "collectionName": "Book",
                  "filter": {
                    "title": {
                      "_eq": "1984"
                    }
                  },
                  "prefixes": [
                    "/1"
                  ]
                }
              }
            }
          }
        }
      ]
    }
  }
}
```

```graphql title='Explain (debug) query with filter over relationship field'
query @explain(type: simple) {
  Book(
    filter: { author: { name: { _like: "%vid%" } } },
  ) {
    title
  }
}
```
```json result
{
  "data": {
    "explain": {
      "operationNode": [
        {
          "selectTopNode": {
            "selectNode": {
              "docID": null,
              "filter": {
                "author": {
                  "name": {
                    "_like": "%vid%"
                  }
                }
              },
              "typeIndexJoin": {
                "direction": "secondary",
                "joinType": "typeJoinOne",
                "root": {
                  "scanNode": {
                    "collectionID": "bafyreidtmanygfdkfs6y56vt4ibztix6zwxrpek6qssnhmlvgd56vg7onm",
                    "collectionName": "Book",
                    "filter": null,
                    "prefixes": [
                      "/1"
                    ]
                  }
                },
                "rootName": "authoredBooks",
                "subType": {
                  "selectTopNode": {
                    "selectNode": {
                      "docID": null,
                      "filter": null,
                      "scanNode": {
                        "collectionID": "bafyreigeutmlyoyydu4e2ppsge5s52xi75ao6bu35psecfejbnk4yoftwq",
                        "collectionName": "Person",
                        "filter": {
                          "name": {
                            "_like": "%vid%"
                          }
                        },
                        "prefixes": [
                          "/2"
                        ]
                      }
                    }
                  }
                },
                "subTypeName": "author"
              }
            }
          }
        }
      ]
    }
  }
}
```

## Query execution metrics (`@explain(type: execute)`) {/* #explain-execute */}

With the `@explain(type: execute)` directive, the query is executed and its runtime metrics are returned as output. Each operator object contains its name and relevant information gathered at runtime.

```graphql title=''
query @explain(type: execute) {
  Book(
    filter: { plot: { _like: "%love%" } },
    order: { plot: ASC },
    limit: 1
  ) {
    title
  }
}
```
```json result
{
  "data": {
    "explain": {
      "executionSuccess": true,
      "operationNode": [
        {
          "selectTopNode": {
            "limitNode": {
              "iterations": 2,
              "orderNode": {
                "iterations": 1,
                "selectNode": {
                  "filterMatches": 1,
                  "iterations": 2,
                  "scanNode": {
                    "docFetches": 7,
                    "fieldFetches": 45,
                    "indexFetches": 0,
                    "iterations": 2
                  }
                }
              }
            }
          }
        }
      ],
      "planExecutions": 2,
      "sizeOfResult": 1
    }
  }
}
```

| Metric | Description |
|--------|-------------|
| `executionSuccess` | Whether the query executed successfully |
| `sizeOfResult` | Number of records in the final result |
| `planExecutions` | Number of times the plan was executed |
| `iterations` | How many times this node was invoked |
| `docFetches` | Number of documents retrieved from storage |
| `filterMatches` | Number of records that passed the filter conditions |

:::tip
High `iterations` or `docFetches` values relative to `filterMatches` may indicate inefficient filtering or missing indexes.
:::

## The effect of indexes on query plans

