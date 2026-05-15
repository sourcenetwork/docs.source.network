---
title: DQL Query Language overview
---


The DefraDB Query Language (DQL) is a [GraphQL](https://graphql.org)-based language for storing and querying data in a DefraDB node. At a high level, there's two type of operations: _query_ and _mutation_ blocks.


## Query blocks

Query blocks describe read-only GraphQL operations for retrieving information from the database, without the ability to alter the database state. Each block can contain multiple subqueries, which are executed concurrently, unless there is some dependency between them.

Queries support database query operations such as filtering, sorting, grouping, skipping/limiting, aggregation, etc. 

## Mutation blocks

Mutations are the `write` side of the DefraDB Query Language. When altering data, mutations rely on the query system to pinpoint the data to be updated or deleted.

All mutation definitions are generated for each defined type in the Database. This is similar to the read query system.

Mutations are similar to SQL `INSERT INTO ...` or `UPDATE` statements. Much like the Query system, all mutations exist inside a `mutation { ... }` block. Several mutations can be run at the same time, independently of one another.
