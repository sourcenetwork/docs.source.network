---
sidebar_label: Aliases
sidebar_position: 90
---

# Aliases

Aliases allow you to rename fields and entire query results in GraphQL to better suit your application's needs. They are especially useful when working with multiple queries within a single request, ensuring better organization and semantic clarity.

```gql
{
    topTenBooks: books(sort: {rating: DESC}, limit: 10) {
        title
        genre
        description
    }
}
```

In the example above, the `books` result is aliased as `topTenBooks`. This makes it easier to understand the purpose of the request and improves organization. It's recommended to use meaningful names for your queries in production deployments.

```gql
{
    topTenBooks: books(sort: {rating: DESC}, limit: 10) {
        title
        genre
        description
    }
    
    bottomTenBooks: books(sort: {rating: ASC}, limit: 10) {
        title
        genre
        description
    }
}
```

In this query, the two results are aliased as `topTenBooks` and `bottomTenBooks` respectively. When working with multiple queries of the same type (e.g., `books`), using aliases to differentiate them is required.

You can also alias individual fields within the returned types. The process for aliasing a field is the same as aliasing a query.

```gql
{
    books {
        name: title
        genre
        description
    }
}
```

In the example above, the `title` field is aliased as `name`. Unlike query aliases, field aliases do not have any specific requirements, as name collisions are not possible within a defined query return type.