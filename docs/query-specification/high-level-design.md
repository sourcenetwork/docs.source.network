---
sidebar_label: High Level Design
sidebar_position: 20
---
# High Level Design

DefraDBs Query Language (DQL) is used to read, write, modify, and delete data in a DefraDB instance. DQL is compliant with the GraphQL specification and uses GraphQL best practices. However, a few divergences from traditional API implementations are necessary since GraphQL was not originally intended to be used as a database query language.

Query language functionalities requires a predefined data schema, using the GraphQL Schema grammar. This allows auto-generation of the necessary types, filters, inputs, payloads, etc. to operate the query language with complete type-safety guarantees. Instances of loose-typing (instead of strong typing) is possible due to the dynamic nature of the query languages. 

DefraDBs query language covers around 99.99% of developer use cases (w.r.t. interacting with their data layer), a distinction between DefraDB and traditional application GraphQL API endpoints. With DefraDB, the binding between GraphQL input/output objects and the underlying data layer is very tight, unlike traditional API endpoints. 

For example, application GraphQL APIs often enable filtering and aggregation only w.r.t. their specific application domain. They proxy all necessary functionality through custom query resolvers (use-case dependent) instead of directly exposing a fully encompassing filter and aggregate layer. DefraDB has no such option, it provides full functionality directly to the developer. There is no concept of domain-specific context the application resides in.

## Features/Limitations

- DQL is a developer-friendly query language and enables multiple query language features (commonly expected from a data layer).
- Read-only and write operations are represented as queries and mutations respectively in GraphQL and other query languages (a major distinction between GraphQL and others). Use of subqueries within mutations (data is inserted based on subquery results) in SQL databases is not currently available in DQL.
- DQL uses custom reserved keywords within GraphQL to enable database query language features. Reserved keywords prefixed by an “_” (underscore) indicate special functionality.
- DQL does not rely on implementation details between deployment environments. DefraDB is intended to operate in different deployment environments.
- Deployment dependent features or deviations between implementations are noted.
- DefraDB offers multiple indexes (with usage  dependent on application). Support for index features and their usage on schemas via directives in query/mutation is provided.