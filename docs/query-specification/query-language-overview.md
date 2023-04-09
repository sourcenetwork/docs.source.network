---
sidebar_label: Query Language Overview
sidebar_position: 10
---

# DefraDB Query Language Overview

The DefraDB query language (DQL) is a GraphQL-based API designed for accessing and querying data stored within a DefraDB node.

[GraphQL](https://graphql.org) is an open-source query language for APIs, developed to make APIs fast, flexible, and developer-friendly. Databases such as [DGraph](https://dgraph.io/) and [Fauna](https://fauna.com) use GraphQL API as a query language for reading and writing data to and from the database. 
- DGraph is a distributed, high-throughput graph database. 
- Fauna is a transactional database delivered as a secure, web-native API with GraphQL support.

DefraDB is designed as a document storage database, unlike DGraph and Fauna. DQL exposes all database functionalities directly, eliminating the need for additional APIs. These functionalities include:
- Reading, writing, and modifying data.
- Defining data structures, schemas, and designing data models (through indexes and other schema-independent, application-specific requirements).

**Exception**: DefraDB's peer-to-peer API is used for interacting with other databases and the underlying CRDTs (for collaborative text editing).

The design of DefraDB is built upon the currently available GraphQL specification. The query Language uses standard GraphQL Schemas with additional directives exposed by DefraDB.