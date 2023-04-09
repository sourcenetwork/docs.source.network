---
sidebar_label: Limiting and Pagination
sidebar_position: 70
---

# Limiting and Pagination in Queries

After applying filtering and sorting to a query, you can further refine the results by limiting and skipping elements from the returned set of objects.

For example, let's retrieve the top 10 highest-rated books:
```gql
{
    books(sort: {rating: DESC}, limit: 10) {
        title
        genre
        description
    }
}
```

The `limit` argument specifies the maximum number of items to return from the resulting set. Additionally, you can use the `offset` argument to skip a certain number of elements in the set. This is helpful for creating a pagination system, where you can limit the number of items displayed per page and navigate through pages as needed.

Let's retrieve the *next* top 10 highest-rated books after the previous query:
```gql
{
    books(sort: {rating: DESC}, limit: 10, offset: 10) {
        title
        genre
        description
    }
}
```

By combining `limit` and `offset` arguments, you can create various pagination methods to effectively manage and display the data in your queries.