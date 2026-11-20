---
title: Profile and explain queries
---

This guide shows you how to run Explain requests in DefraDB to understand query execution and identify optimization opportunities.

## Run a Simple Explain Request

A Simple Explain request shows the execution plan without running the query. Add the `@explain` directive to your query:


```graphql
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

relations

```graphql
query @explain(type: debug) {
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
              "typeIndexJoin": {
                "typeJoinOne": {
                  "root": {
                    "scanNode": {}
                  },
                  "subType": {
                    "selectTopNode": {
                      "selectNode": {
                        "scanNode": {}
                      }
                    }
                  }
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

## simple plans

```graphql
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


```graphql
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

## execute

```
{
  "data": {
    "explain": {
      "executionSuccess": true,
      "operationNode": [
        {
          "selectTopNode": {
            "limitNode": {
              "iterations": 1,
              "selectNode": {
                "filterMatches": 0,
                "iterations": 1,
                "scanNode": {
                  "docFetches": 0,
                  "fieldFetches": 0,
                  "indexFetches": 7,
                  "iterations": 1
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


### Understanding the Response

The response shows the Plan Graph structure. In this example:

- **selectTopNode**: The root of the query plan
- **selectNode**: Handles the selection operation
- **scanNode**: Performs a sequential scan of the `Author` collection
  - `collectionID` and `collectionName` identify the target collection
  - `spans` indicate the key range being scanned
  - `filter: null` means no additional filtering is applied at this node

This query performs a full collection scan because no index or filter is specified. For large collections, consider adding filters or indexes to improve performance.

## Run an Execute Explain Request

An Execute Explain request runs the query and collects runtime metrics. Use the `type: execute` argument:

### Request

```graphql
query @explain(type: execute) {
  Author {
    name
    age
  }
}
```

### Response

```json
[
  {
    "explain": {
      "executionSuccess": true,
      "sizeOfResult": 1,
      "planExecutions": 2,
      "selectTopNode": {
        "selectNode": {
          "iterations": 2,
          "filterMatches": 1,
          "scanNode": {
            "iterations": 2,
            "docFetches": 2,
            "filterMatches": 1
          }
        }
      }
    }
  }
]
```

### Understanding the Response

The Execute Explain response includes the same Plan Graph structure plus runtime metrics:

| Metric | Description |
|--------|-------------|
| `executionSuccess` | Whether the query executed successfully |
| `sizeOfResult` | Number of records in the final result |
| `planExecutions` | Number of times the plan was executed |
| `iterations` | How many times this node was invoked |
| `docFetches` | Number of documents retrieved from storage |
| `filterMatches` | Number of records that passed the filter conditions |

These metrics help identify performance bottlenecks. High `iterations` or `docFetches` values relative to `filterMatches` may indicate inefficient filtering or missing indexes.

> **Tip:** Execute Explain takes longer than Simple Explain because it actually runs the query. It also adds slight overhead compared to a normal query due to metric collection. Use Simple Explain for quick structural analysis and Execute Explain when you need actual performance data.
