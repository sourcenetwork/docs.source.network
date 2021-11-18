---
sidebar_label: Aliases
sidebar_position: 90
---
<<<<<<< HEAD
# Aliases
=======
# Aliases

Often the returned structure of a query isn't in the ideal context for a given application. In this instance we can rename fields and entire query results to better fit our use case. This is particularly useful, and sometimes necessary when using multiple queries within a single request

```javascript
{
    topTenBooks: books(sort: {rating: DESC}, limit: 10) {
        title
        genre
        description
    }
}
```

Here we have renamed the books result to `topTenBooks`, which can be useful for semantic reasoning about the request, and for organizational purposes. It is suggested in production deployments to name your queries properly.

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

In this query we have two returned results named `topTenBooks` and `bottomTenBooks` respectively. When dealing with multiple queries of the same type (e.g. `books`) it is required to alias one from another.

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
>>>>>>> 0c435cfc9047efae6c56574bbabd6af493514f45
