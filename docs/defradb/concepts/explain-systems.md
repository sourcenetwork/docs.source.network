---
sidebar_label: Explain system
sidebar_position: 11
---

# Explain system concepts

## Overview

The Explain System in DefraDB helps developers understand how queries and mutations are executed. By adding a single directive to a request, you can inspect the execution plan, view the Plan Graph, and gain insights into performance. This transparency allows you to identify bottlenecks, optimize queries, and understand the internal operations of the database.

As applications grow and schemas expand, requests may include operations such as type joins or sorting large datasets. These increase database workload and affect performance. Without visibility into how operations execute, the database becomes a "black box," making optimization difficult. The Explain System addresses this by revealing the request execution plan and relevant runtime metrics.

## Plan Graph Fundamentals

When DefraDB receives a request, the request planner converts it into a series of operations represented in a **Plan Graph**. The Plan Graph is a directed structure where each node represents a specific unit of work, such as a scan, sort, or filter. Nodes are arranged hierarchically so that the output of one node becomes the input for the next.

This structure enables:

- Concurrent traversal of different branches
- Independent optimization of subgraphs
- Breakdown of complex queries into smaller, manageable steps

By decomposing queries this way, the Plan Graph improves both performance and scalability.

## Interpreting the Plan Graph

The Plan Graph shows the execution strategy for a query as a series of nodes. Each node represents a step in query processing. Understanding these nodes helps you evaluate whether a query is efficient or needs optimization.

### Common Node Types

| Node Type | Description | When It Appears | Optimization Guidance |
|-----------|-------------|-----------------|----------------------|
| **Scan Node** | Performs a sequential scan through the collection to find matching records | When no index is used or when a full table scan is required | If scans are slow on large datasets, consider adding an index |
| **Index Node** | Uses an index to quickly locate matching records | When a query matches indexed fields | Confirms index usage; if absent when expected, review query filters and indexing strategy |
| **Filter Node** | Applies conditions to filter out records after scanning or indexing | When the query has WHERE clauses or filters | Moving filters into indexed fields can reduce post-scan work |
| **Sort Node** | Orders results based on one or more fields | When queries include ORDER BY clauses | Sorting can be expensive; adding a sorted index can help |
| **Limit Node** | Restricts the number of records returned | When the query uses a LIMIT or TOP clause | Useful for performance tuning with large datasets |
| **Join Node** | Combines records from multiple collections or data sources | When the query involves related entities | Joins can be costly; verify that join paths and indexes are optimized |
| **Projection Node** | Selects only specific fields to return | When queries specify certain fields instead of retrieving entire records | Helps reduce network and memory usage |
| **Aggregation Node** | Performs calculations such as COUNT, SUM, AVG | When queries include aggregation functions | Consider pre-aggregating or indexing data to speed results |

Not all nodes appear in every Plan Graph. The combination and order of nodes reflect the exact steps DefraDB takes to resolve your query.

## Benefits of the Explain System

The Explain System provides detailed visibility into query execution:

**Avoiding full scans:** Most queries begin with a scan node, which searches the entire collection sequentially. This can be slow for large datasets. The Explain System reveals when full scans occur, helping you decide whether to add a secondary index.

**Evaluating index effectiveness:** Determining the performance benefit of adding an index can be challenging. The Explain System shows whether your query would use an index and how it affects the Plan Graph—without actually building the index or executing the query.

**Improving transparency:** Explain requests show whether a full table scan or index scan will be conducted, and which other operations are involved. This helps you understand exactly what steps are required to execute your queries.

**Optimizing query patterns:** Some query patterns are more efficient than others. For example, querying from primary to secondary is typically more efficient than secondary to primary. The Explain System demonstrates these differences, helping you write better queries.

## Types of Explain Requests

DefraDB supports two types of Explain requests:

### Simple Explain

Simple Explain returns only the structural information of the Plan Graph—its nodes and their attributes. It does not execute the plan, making it extremely fast. Use Simple Explain to understand how the database would resolve a request without incurring execution overhead.

### Execute Explain

Execute Explain constructs and executes the Plan Graph, collecting runtime metrics such as iterations, document fetches, and filter matches. This is similar to `EXPLAIN ANALYZE` in PostgreSQL or MySQL. Use Execute Explain when you need actual performance data, not just the execution plan structure.

> **Note:** Execute Explain takes longer than Simple Explain because it runs the query. It also takes slightly longer than a normal query due to the overhead of measuring and collecting metrics.

## Related Resources

- [How to Run Explain Requests](explain-system-how-to.md) — Step-by-step instructions for running Simple and Execute Explain requests
- [Plan Node Reference](https://github.com/sourcenetwork/defradb/blob/develop/internal/planner/explain.go#L35) — Complete list of explainable plan nodes in DefraDB
