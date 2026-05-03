---
title: Query the database
---

The DefraDB Query Language (DQL) is a [GraphQL](https://graphql.org)-based language for storing and querying data in a DefraDB node.


## Query Block

Query blocks are read-only GraphQL operations designed only to request information from the database, without the ability to mutate the database state. They contain multiple subqueries which are executed concurrently, unless there is some variable dependency between them.

Queries support database query operations such as filtering, sorting, grouping, skipping/limiting, aggregation, etc. These query operations can be used on different GraphQL object levels, mostly on fields that have some relation or embedding to other objects.


# Mutation Block

Mutations are the `write` side of the DefraDB Query Language. They rely on the query system to function properly. Updates, upserts and deletes, all require filtering and finding data before taking action. 

The data and payload format that mutations use is fundamental to maintaining the designed structure of the database. All mutation definitions are generated for each defined type in the Database. This is similar to the read query system.

Mutations are similar to SQL `INSERT INTO ...` or `UPDATE` statements. Much like the Query system, all mutations exist inside a `mutation { ... }` block. Several mutations can be run at the same time, independently of one another.
