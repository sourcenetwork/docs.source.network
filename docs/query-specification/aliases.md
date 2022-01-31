---
sidebar_label: Aliases
sidebar_position: 90
---
# Aliases

If the structure of a returned query is not ideal for a given application, you can rename fields and entire query results to better fit your use case. This is particularly useful, and sometimes necessary when using multiple queries within a single request.

```javascript
{
    topTenBooks: books(sort: {rating: DESC}, limit: 10) {
        title
        genre
        description
    }
}
```

Here the books result is renamed to `topTenBooks`, which can be useful for semantic reasoning about the request, and for organizational purposes. It is suggested in production deployments to name your queries properly.

```javascript
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

In this query the two returned results are named `topTenBooks` and `bottomTenBooks` respectively. When dealing with multiple queries of the same type (e.g. `books`) it is required to alias one from another.

Additionally, we can alias individual fields within our returned types. Aliasing a field works the same as aliasing a query.

```javascript
{
    books {
        name: title
        genre
        description
    }
}
```

Here we have renamed the `title` field to `name`. Unlike query aliases, there is no requirement in any context since name collisions are impossible within a defined query return type.
