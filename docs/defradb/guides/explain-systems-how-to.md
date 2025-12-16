---
sidebar_label: Explain system how-to guide
sidebar_position: 11
---

# How to Use the Explain System

This guide shows you how to run Explain requests in DefraDB to understand query execution and identify optimization opportunities.

## Prerequisites

- A running DefraDB instance
- Access to the GraphQL API
- An existing schema with collections (the examples use an `Author` collection)

## Run a Regular Request

A standard GraphQL request returns data directly from the database:

```graphql
query {
  Author {
    _docID
    name
    age
  }
}
```

This executes the query and returns the matching author records.

## Run a Simple Explain Request

A Simple Explain request shows the execution plan without running the query. Add the `@explain` directive to your query:

### Request

```graphql
query @explain {
  Author {
    name
    age
  }
}
```

You can also explicitly specify the type:

```graphql
query @explain(type: simple) {
  Author {
    name
    age
  }
}
```

### Response

```json
{
  "explain": {
    "selectTopNode": {
      "selectNode": {
        "filter": null,
        "scanNode": {
          "filter": null,
          "collectionID": "3",
          "collectionName": "Author",
          "spans": [
            { "start": "/3", "end": "/4" }
          ]
        }
      }
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

## Example: Analyzing a Filtered Query

Here's an example with a filter to show how the Plan Graph changes:

### Request

```graphql
query @explain {
  Author(filter: { age: { _gt: 30 } }) {
    name
    age
  }
}
```

### Response

```json
{
  "explain": {
    "selectTopNode": {
      "selectNode": {
        "filter": {
          "age": { "_gt": 30 }
        },
        "scanNode": {
          "filter": null,
          "collectionID": "3",
          "collectionName": "Author",
          "spans": [
            { "start": "/3", "end": "/4" }
          ]
        }
      }
    }
  }
}
```

Notice that the `filter` now appears in the `selectNode`, showing that the condition will be applied after scanning. If you have an index on the `age` field, the Plan Graph would show an `indexNode` instead of or alongside the `scanNode`.

## Next Steps

- Review the [Explain System Concepts](../concepts/explain-systems.md) to understand Plan Graph nodes and optimization strategies
- Experiment with adding indexes to your schema and observe how the Plan Graph changes
- Use Execute Explain to measure actual query performance before and after optimizations
