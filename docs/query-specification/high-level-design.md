---
sidebar_label: High Level Design
sidebar_position: 20
---
# High Level Design

DefraDBs Query Language (DQL) is used to read, write, modify, and delete data in a DefraDB instance. DQL is compliant with the GraphQL specification and uses GraphQL best practices. However, a few divergences from traditional API implementations are necessary since GraphQL was not originally intended to be used as a database query language.

Query language functionalities requires a predefined data schema, using the GraphQL Schema grammar. This allows auto-generation of the necessary types, filters, inputs, payloads, etc. to operate the query language with complete type-safety guarantees. Instances of loose-typing (instead of strong typing) is possible due to the dynamic nature of the query languages. 

DefraDBs query language covers around 99.99% of developer use cases (w.r.t. interacting with their data layer), a distinction between DefraDB and traditional application GraphQL API endpoints. With DefraDB, the binding between GraphQL input/output objects and the underlying data layer is very tight, unlike traditional API endpoints. 

For example, application GraphQL APIs often enable filtering and aggregation only w.r.t. their specific application domain. They proxy all necessary functionality through custom query resolvers (use-case dependent) instead of directly exposing a fully encompassing filter and aggregate layer. DefraDB has no such option, it provides full functionality directly to the developer. There is no concept of the domain-specific context the application resides in.

DQL needs to be as developer-friendly as possible by enabling multiple query language features (commonly expected from a data layer).

GraphQL and other query languages  due to 

The read-only operations and write operations are represented as queries and mutations respectively in GraphQL and other query languages. This is the major distinction between GraphQL and others. Use of subqueries within mutations (data is inserted based on subquery results) in SQL databases is a feature not available in DQL.





DQL will make notable use of custom reserved keywords within the GraphQL that will exist only to enable database query language features further. For the most part, reserved keywords will be prefixed by an “_” (underscore) to indicate some kind of special functionality. For example, when filtering or sorting data, the “_lt” (less than) or “_asc” (ascending) keywords will be used to indicate some desired functionality or behavior.

This Query Language specification will try not to make any attempt to rely on implementation details between deployment environments, as DefraDB is intended to operate in several very different deployment environments. If any feature is either deployment dependent, or deviates between implementations, it will be noted as much. Additionally, this specification will try not to indicate best practices (will be covered in another document), and only provide the direct features and references available. This may be most notable when discussing indexes, DefraDB will offer many different types of indexes, each of which has its own pros and cons, and their use is very dependent on the application use case. For completeness, the use of indexes on schemas via directives will be discussed, as well as what features specific indexes provide, but only so far as they relate to the use of them in a Query/Mutation, and not how they might be best used for a particular application.