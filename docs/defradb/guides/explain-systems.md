---
sidebar_label: Explain Systems Guide
sidebar_position: 20
---
# A Guide to Explain Systems in DefraDB

## Overview

The DefraDB Explain System is a powerful tool designed to provide insight into query execution. It introspects requests, analyzes plan graphs, and offers developers a clear understanding of how queries and mutations are executed within DefraDB. Requests can vary from simple information queries to complex, multi-step operations, all enhanced with a single directive added to the request.

### Regular Request

```graphql
query {
    Author {
      _docID
      name
      age
    }
}
```

### Explain Request

```graphql
query @explain {
    Author {
      _docID
      name
      age
    }
}
```

As application demands grow and schemas expand, requests often become more complex. This could involve adding a type-join or sorting large data sets, which can significantly increase the workload for the database. These complexities often require fine-tuning the query or schema to ensure faster execution. However, without tools to introspect and understand how the query will execute, the database remains a "black box" to developers, limiting their ability to optimize it effectively. This is why DefraDB offers the option to request an explanation of query execution, plan graphs, and runtime metrics.

By using the Explain System, developers can gain a clearer view of query resolution. Rather than simply requesting data, these queries ask the database to outline the steps it would take to resolve the request and execute all necessary operations before generating the result. This process provides transparency into potential bottlenecks, such as inefficient scans or redundant sorting operations. The Explain System enables developers to understand the intricate inner workings of the database and the operations required to resolve requests.

## Planner and Plan Graph

The request planner is a central component of DefraDB, responsible for executing and presenting results. Upon receiving a request, the database transforms it into a series of operations planned and implemented by the request planner. These operations are represented as a Plan Graph, a directed graph that visualizes the operations the database must perform to deliver the requested information.

The Plan Graph plays an essential role in the system as it offers a structured representation of requests. This structure allows for parallel traversal, branch exploration, and independent subgraph optimization. Each node in the Plan Graph represents a specific operation, such as scans, index lookups, sorting, or filtering. The graph’s structure is hierarchical, where nodes depend on the output of preceding ones. For instance, the final output might rely on earlier operations like state rendering, which itself depends on state limiting, sorting, and scanning.

The Plan Graph simplifies complex operations into smaller, manageable tasks, improving the database’s performance and scalability.

Together with the Explain System, the Plan Graph offers developers essential insights into how the database executes requests, providing transparency into every step of the process.

## Benefits

The Explain System is a valuable tool for optimizing database queries and enhancing performance. Here are some of its key advantages:

### Efficient Query Execution

Queries typically begin with a scan node, a method that searches the entire key-value collection. This can be slow for large datasets. By using indexes, DefraDB allows for a space-time tradeoff that improves performance and avoids the need for full scans.

### Insights into Index Performance

Determining the impact of adding a secondary index can be difficult. The Explain System provides valuable insights into DefraDB’s internal operations, including how the plan graph and indexes affect query execution. Developers can request an explanation without executing the query or building the index, making it easy to analyze the potential impact.

### Enhanced Transparency

When an Explain request is issued, it reveals whether a full table scan or an index scan will be performed, and it shows which other operations are involved. This transparency helps developers understand the steps the database will take to resolve queries and create more efficient ones.

### Query Optimization

For example, querying from primary to secondary indexes is more efficient than the reverse. The Explain System helps identify inefficiencies, such as performing a simple point lookup rather than using an efficient join index. Overall, it provides developers with valuable insights into the database’s internal operations, enabling better optimization strategies.

## How it works

When a request is made to the database, it is either executed or explained. By default, the database will execute the request, compiling it, constructing a plan, and evaluating the plan's nodes to produce the result.

Alternatively, an Explain request compiles the query, constructs a plan, and walks through the plan graph, collecting node attributes and execution metrics. This provides a detailed overview of each part of the plan, helping developers understand how the request is resolved.

The plan is presented as a graph, which is both quick to process and easy to comprehend. Explain requests offer an organized view of the plan graph, where developers can understand the structure and key operations involved in query execution. Although minor details might be omitted, the core elements of the plan are displayed, giving developers a clear understanding of the necessary steps to execute the request efficiently.

## Types of Explain Requests

### Simple Explain

The default mode of the Explain System is the Simple Explain Request. This request requires only the `@explain` directive. Developers can also specify the `@explain(type: simple)` directive for clarity.

A Simple Explain request returns the syntactic and structural details of the Plan Graph, including the nodes and their attributes.

Here’s an example of a Simple Explain request applied to an `Author` query:

```graphql
query @explain {
    Author {
        name
        age
    }
}
```

```json
// Response
{
    "explain": {
        "select TopNode": {
            "selectNode": {
                "filter": null,
                "scanNode": {
                    "filter":null,
                    "collectionID": "3",
                    "collectionName": "Author",
                    "spans": [{
                        "start": "/3",
                        "end": "/4"
                    }]
                }
            }
        }
    }
}
```

Simple Explain requests are very fast since they don’t actually execute the plan graph. They’re designed to give developers a transparent view of the operations that would occur during query execution.

### Execute Explain

The Execute Explain request goes beyond Simple Explain by actually executing the constructed plan graph. While it doesn’t return query results, it collects various metrics and runtime information about the execution process and returns these in the same plan graph format used by the Simple Explain request. This functionality is akin to the EXPLAIN ANALYZE feature in databases like PostgreSQL or MySQL.

To initiate an Execute Explain request, simply specify `@explain(type: execute)` in the query directive.

Here’s an example of an Execute Explain request applied to an `Author` query:

```graphql
query @explain(type: execute) {
 Author {
  name
  age
 }
}
```

```json
// Response
[
 {
  "explain": {
   "executionSuccess": true,
   "sizeOfResult":     1,
   "planExecutions":   2,
   "selectTopNode": {
    "selectNode": {
     "iterations":    2,
     "filterMatches": 1,
     "scanNode": {
      "iterations":    2,
      "docFetches":    2,
      "filterMatches": 1
     }
    }
   }
  }
 }
]
```

Execute Explain requests take longer to process compared to Simple Explain, as they involve executing the plan and measuring additional runtime metrics.

## Limitations

While the Explain System offers great benefits, it does come with a limitation: it violates the formal specification of the GraphQL API. Normally, a request sent to a user collection returns an array of users. However, when an Explain directive is added, the response structure changes and represents the plan graph rather than the expected array.

Although this deviation from the schema is an acceptable tradeoff to improve the developer experience, it’s essential to keep this limitation in mind.

## Next Steps

A future feature called Prediction Explain will aim to provide a balance between speed and detail. Prediction Explain will not execute the plan graph but will offer predictions based on request attributes and metrics. This approach will be faster than the Execute Explain but more informative than the Simple Explain.

In the long term, the Explain System aims to offer multiple representations of the Plan Graph. These could include a human-readable text format and a visual graph that shows the top-down structure of the plan. Additionally, the system is being developed to allow developers to serialize and analyze the Plan Graph in various ways, making it even more powerful and flexible.
