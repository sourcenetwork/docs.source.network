---
sidebar_label: Query Block
sidebar_position: 30
---
# Query Block

Query blocks are a read-only GraphQL operations designed only to request information from the database. They contain multiple subqueries which are executed concurrently, unless there is some variable (see [Variable Blocks](variables.md)) dependency between them.

Queries support database query operations such as filtering, sorting, grouping, skipping/limiting, and aggregation. These query operations can be used on different GraphQL object levels, mostly on fields that have some relation or embedding to other objects.