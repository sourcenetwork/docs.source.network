---
sidebar_position: 4
---

# Query Specification

The purpose of this document is to specify the DefraDB Query language only. The intent, design decisions, and other auxiliary information is a secondary objective, and added only if it is needed by the primary specification objective to add context. See the DefraDB Design Doc for further details on DefraDB as a whole, and the Query Language beyond the concrete specification, such as implementation details.

## Query Language Overview

The following is a succinct description of the query language, its goals, and design choices to place this document in the correct context.

The DefraDB Query Language (DQL) is a GraphQL defined API to access and query data residing inside a DefraDB node. GraphQL was used due to its malleable nature which provides the developer with as much freedom and rigidity as possible. GraphQL is an API specification designed at Facebook as a replacement for ReSTful API, aiming to reduce overhead, N+1 queries, extra network round trips, and to simplify the correlation between application state, and API representation. Initially, it was not designed as a database query language, but has started to be adopted within the Database community compared to traditional SQL or more proprietary query languages like MongoDB Query and others. Notable databases that have led the charge for GraphQL’s adoption have been DGraph and Fauna. These databases expose a native GraphQL API as a query language to read and write data from/to the database. Each has its own approaches and differences; most notably, DGraph is a Graph database, which imposes different relational structure and data modeling requirements. Alternatively, Fauna tries to maintain the more traditional SQL relational model for its database which is replicated to the GraphQL domain.

DefraDB, while using GraphQL like the other databases mentioned above, is designed as a Document Store database, which is again different from the Graph and SQL databases of DGraph and Fauna, respectively. As such, during our literature review, we kept in mind our unique requirements imposed by this model.

Our Query Language exposes every functionality of the database directly, without the need for any additional APIs. Including; reading, writing, and modifying data, describing data structures, schemas, and architecting data models via index’s and other schemas independent, application-specific requirements. With the notable exception of DefraDBs PeerAPI (outlined in the DefraDB Specification), which is used to interact with other peers’ databases, and with the underlying CRDTs, in the case of collaborative text editing.

Our initial design relies only on the currently available GraphQL specification, which has a stable version tagged June 2018 Edition. Initially the GraphQL Query Language will utilize standard GraphQL Schemas, with any additional directives exposed by DefraDB. In the future, we will migrate to Source Schemas, which can compile to GraphQL schemas, but include their semantic and syntactic structures, content addressable composability, and others. DefraDBs CRDT types will initially be automatically mapped to GraphQL types; over time, we plan to have mechanisms to control the underlying CRDT types.

## Document Model

As mentioned above, DefraDB uses a Document API model, which is distinctive from traditional SQL models. The main differences rely on the normative nature of data within SQL versus the more simplistic Document model. The benefits of the Document Model are because how closely your data state is able to represent your application state, which gives rise to the concept that Document stores in the NoSQL world are more “Developer Friendly”. SQL was designed from an academic, formally defined perspective, which makes it very “Teachable” and easier. for professors to teach it within an educational setting. In most Database 101 classes, we first learn about Relational Algebra, a strictly defined formal language for expressing relationships between data, and SQL is a widespread implementation of this formal language. It allows for fine-tuned query expressions; however, it is very disconnected from both the Application state and conceptual models humans rely on to reason about data.

As a result, GraphQL is a perfect pairing for Document Model databases as the GraphQL schema system closely resembles both Application state, and common Document model Schemas, which results in the least number of context switches when trying to reason about how your application state persists to your datastore. The downside is the lack of expressionism compared to SQL; however, SQLs powerful expressions are inherently required by its complex data model. Using a more simplistic data model doesn’t require as powerful expressions to reason about. SQL relies on normalized data, indirection, join tables, and more, which make constructing queries hyper-specific to SQL, and even implementation-specific between SQL options. Document Models have a more flexible system, which doesn’t enforce normalization, and can more easily represent relations and embeddings between types.

## DefraDB Query Language (DQL)

### High - Level Design

DefraDBs GraphQL Query Language, or DQL for shit, is used to read, write, modify, and delete data residing within a DefraDB instance. The entire language is compliant with the GraphQL specification, and will attempt to use GraphQL best practices. However, since GraphQL was not originally intended as a Database query language, small divergences are necessary from traditional API implementations.

Currently, all query language functionality requires a predefined data schema, using the GraphQL Schema grammar. This will allow us to auto-generate all the necessary types, filters, inputs, payloads, etc to operate the query language with complete type safety guarantees. There may be instances where “Loose Typing” is used in place of Strong Typing, due to the dynamic nature of query languages, and the powerful and expressive features it enables.

Additionally, DefraDBs query language will need to cover 99.99% of developer use cases with respect to interacting with their data layer. This is a notable distinction between this query language, and traditional application GraphQL API endpoints. Traditional API endpoints assume that the developers have the freedom to control their data as they see fit, before returning it through a GraphQL response object. With DefraDB, the binding between GraphQL input/output objects, and the underlying data layer is very tight.

As an example, application GraphQL APIs often enable filtering and aggregation only with respect to their specific application domain. Instead of directly exposing a fully encompassing filter and aggregate layer, they proxy all necessary functionality through custom Query resolvers, that are use case dependent. DefraDB has no such option, since it must provide full functionality and expressiveness directly to the developer. It, has no concept of the domain-specific context the application resides in.

However, DQL still needs to be as developer-friendly as possible, enabling many query language features commonly expected from a data layer.

The major distinction between GraphQL and other database query languages, is the explicit distinction from read-only operations, and write operations, represented as Queries and Mutations respectively. The only hindrance this exposes is the use of subqueries within mutations, commonly found in SQL databases, where one might insert data based on a subquery results. This ideally will be resolved in future versions of DQL.

DQL will make notable use of custom reserved keywords within the GraphQL that will exist only to enable database query language features further. For the most part, reserved keywords will be prefixed by an “_” (underscore) to indicate some kind of special functionality. For example, when filtering or sorting data, the “_lt” (less than) or “_asc” (ascending) keywords will be used to indicate some desired functionality or behavior.

This Query Language specification will try not to make any attempt to rely on implementation details between deployment environments, as DefraDB is intended to operate in several very different deployment environments. If any feature is either deployment dependent, or deviates between implementations, it will be noted as much. Additionally, this specification will try not to indicate best practices (will be covered in another document), and only provide the direct features and references available. This may be most notable when discussing indexes, DefraDB will offer many different types of indexes, each of which has its own pros and cons, and their use is very dependent on the application use case. For completeness, the use of indexes on schemas via directives will be discussed, as well as what features specific indexes provide, but only so far as they relate to the use of them in a Query/Mutation, and not how they might be best used for a particular application.

### Query Block

The Query Block is the read-only GraphQL operation designed to soley request information from the database, and cannot mutate the databases state. Query Blocks can contain multiple subqueries that are executed concurrently, unless there is some variable dependency between them (See: Variable Blocks).

Queries support most traditional database query operations like: Filtering, sorting, grouping, skipping/limiting, aggregation, and more. Many of the available query operations can be used on different GraphQL object levels, most notably on fields that have some relation or embedding to other objects.
### Collections

Each and every developer-defined type is attached to a Collection. A Collection is similar to a SQL Table, which represents a group of documents with similar structures.

Each collection gets an auto-generated query field, allowing users and developers to query, filter, select, and interact with documents in several different ways.

### Filtering

Provided a collection of documents, we can filter on a number of fields and predicates, including compound predicates via conditional keywords like (_and, _or, _not).

Basic filtering is exposed through the filter keyword, and can be supplied as arguments to a root level field, or subfields that contain some kind of embedding or relation.

The following shows the use of the filter keyword on the root level books field. An empty filter object is equivalent to no filters at all, so it will match all objects it is applied to. In this case, it will return all books.

```javascript
{
	books(filter: {}) {
		title
		genre
		description
	}
}
```
Some of the available filtering options depend on the available indexes on a field, but, we will omit this for now.

To apply a filter to a specific field, we can specify it within the filter object.

The following only returns books with the title “A Painted House”

```javascript
{
	books(filter: { title: "A Painted House" }) {
		title
		genre
		description
	}
}
```

We can apply filters to as many fields as are available. Note, each additional listed field in the filter object implies an AND conditional relation.

```javascript
{
	books(filter: { title: "A Painted House", genre: "Thriller" }) {
		title
		genre
		description
	}
}
```

The above query is equivalent to the statement: Return all the books with the title “A Painted House” AND whose genre is “Thriller”.

Filtering is also possible on subfields that have relational objects within them.

Given a Book object, with an Author field which is a many-to-one relationship to the Author object, we can query and filter based on Author field value.

```javascript
{
	books(filter: { genre: "Thriller", author: {name: "John Grisham"}}) {
		title
		genre
		description
		author {
			name
			bio
		}
}
```

This query returns all books authored by "John Grisham" with the genre “Thriller”.

Filtering from the root object, compared to sub objects results in different semantics. Root filters that apply to sub objects, like the author section of the above query, only return the root object type if there is a match to the sub object filter. E.g. We will only return books, if the author filter condition accepts.

This applies to both single sub-objects, and array sub-objects. Meaning, if we apply a filter on a sub-object, and that sub-object is an array, we will only return the root object, if at least one sub-object matches the given filter instead of requiring every sub-object to match the query.

The following query will only return authors, if they have at least one book whose genre is a thriller

```javascript
{
    authors(filter: {book: {genre: {_eq: "Thriller"}}}) {
        name
        bio
    }
}
```

Moreover, if we include the sub-object we filter on, which is an array, in the selection set, the filter is then implicitly applied unless specified otherwise.

From the above query, let’s add books to the selection set.

```javascript
{
    authors(filter: {book: {genre: {_eq: "Thriller"}}}) {
        name
        bio
        books {
            title
            genre
        }
    }
}
```

Here, the books section will only contain books that match the root object filter, E.g.: {genre: {_eq: "Thriller"}}. If we wish to return the same authors from the above query and include all their books, we can directly add an explicit filter to the sub-object instead of just the sub-filters.

```javascript
{
    authors(filter: {book: {genre: {_eq: "Thriller"}}}) {
        name
        bio
        books(filter: {}) {
            title
            genre
        }
    }
}
```

Here, we only return authors who have at least one book with the genre set to “Thriller”. However, we then return all that specific authors’ books, instead of just their thrillers.

Applying filters solely to sub-objects, which is only applicable for Array types, is computed independently from the root object filters.

```javascript
{
	authors(filter: {name: "John Grisham"}) {
		name
		bio
		books(filter: { genre: "Thriller" }) {
			title
			genre
			description
		}
}
```

The above query returns all authors with the name “John Grisham”, then filters and returns all the returned authors’ books whose genre is “Thriller”. This is similar to the previous query, but an important distinction is that it will return all the matching Author objects regardless of the book’s sub-object filter.

The first query, will only return if there are Thriller books AND its author is “John Grisham”. The second query always returns all authors named “John Grishams”, and if they have some books with the genre “Thriller”, return those as well.

So far, we have only looked at EXACT string matches, but we can filter on any scalar type or object fields, like booleans, integers, floating points, and more. To use other comparison operators, we can specify Greater Than, Less Than, Equal or Greater than, Less Than or Equal to, and of course, EQUAL.

Let’s query for all books with a rating greater than or equal to 4.

```javascript
{
	books(filter: { rating: { _gte: 4 } }) {
		title
		genre
		description
}
```
:::note
Our filter expression contains a new object { _gte: 4 }, instead of before, where we had a simple string value. If a field is a scalar type, and its filter is given an object value, that object’s first and only key must be a comparator operator like _gte. If the filter is given a simple scalar value, like “John Grisham”, “Thriller”, or FALSE, the default operator is _eq (EQUAL).
:::

See the following table for a reference of available operators

| Operator | Description |
| -------- | --------    |
| `_eq`    | Equal to        |
| `_neq`   | Not Equal to        |
| `_gt`    | Greater Than        |
| `_gte`   | Greater Than or Equal to        |
| `_lt`    | Less Than        |
| `_lte`   | Less Than or Equal to        |
| `_in`    | In the List        |
| `_nin`   | Not in the List        |
| `_like`  | Sub-String Like        |

