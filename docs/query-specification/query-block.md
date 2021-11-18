---
sidebar_label: Query Block
sidebar_position: 30
---
# Query Block

The Query Block is the read-only GraphQL operation designed to soley request information from the database, and cannot mutate the databases state. Query Blocks can contain multiple subqueries that are executed concurrently, unless there is some variable dependency between them (See: Variable Blocks).

Queries support most traditional database query operations like: Filtering, sorting, grouping, skipping/limiting, aggregation, and more. Many of the available query operations can be used on different GraphQL object levels, most notably on fields that have some relation or embedding to other objects.