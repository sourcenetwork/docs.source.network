---
sidebar_label: Query Block
sidebar_position: 30
---

# Query Block

Query blocks are read-only GraphQL operations designed solely for requesting information from the database without the ability to mutate the database state. They contain multiple subqueries that are executed concurrently, unless there is a variable dependency between them (see [Variable Blocks](variables.md)).

Queries support various database query operations, such as filtering, sorting, grouping, skipping/limiting, and aggregation. These operations can be applied on different GraphQL object levels, primarily on fields that have a relationship or are embedded within other objects.