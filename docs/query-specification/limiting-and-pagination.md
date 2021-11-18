---
sidebar_label: Limiting and Pagination
sidebar_position: 70
---
<<<<<<< HEAD
# Limiting and Pagination
=======
# Limiting and Pagination

After filtering and sorting a query, we can then limit and skip elements from the returned set of objects.

Let us get the top 10 rated books
```javascript
{
    books(sort: {rating: DESC}, limit: 10) {
        title
        genre
        description
    }
}
```

Here we introduce the `limit` function, which accepts the max number of items to return from the resulting set.

Next, we can skip elements in the set, to get the following N objects from the return set. This can be used to create a pagination system, where we have a limit of items per page, and skip through pages.

Let's get the *next* top 10 rated books after the previous query
```javascript
{
    books(sort: {rating: DESC}, limit:10, offset: 10) {
        title
        genre
        description
    }
}
```

Limits, and offsets can be combined to create several different pagination methods.
>>>>>>> 0c435cfc9047efae6c56574bbabd6af493514f45