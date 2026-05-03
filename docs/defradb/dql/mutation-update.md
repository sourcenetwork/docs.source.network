---
title: Update existing documents
---

Updates are distinct from Inserts in several ways. Firstly, it relies on a query to select the correct document or documents to update. Secondly, it uses a different payload system.

Update filters use the same format and types from the Query system. Hence, it easily transferable.

The structure of the generated update mutation for a `Book` type is given below:
```graphql
mutation {
    update_Book(docID: ID, filter: BookFilterArg, input: updateBookInput) [Book]
}
```

See the structure and syntax of the filter query above. You can also see an additional field `id`, thawhich will supersede the `filter`; this makes it easy to update a single document by a given ID.

The input object type is the same for both `update_TYPE` and `create_TYPE` mutations.

Here's an example.
```json
{
    name: "John",
    rating: nil
}
```

This update sets the `name` field to "John" and deletes the `rating` field value.

Once we create our update, and select which document(s) to update, we can query the new state of all documents affected by the mutation. This is because our update mutation returns the type it mutates.

A basic example is provided below:
```graphql
mutation {
    update_Book(docID: '123', input: {name: "John"}) {
        _key
        name
    }
}

```

Here, we can see that after applying the mutation, we return the `_key` and `name` fields. We can return any field from the document (not just the updated ones). We can even return and filter on related types.

Beyond updating by an ID or IDs, we can use a query filter to select which fields to apply our update to. This filter works the same as the queries.

```graphql
mutation {
    update_Book(filter: {rating: {_leq: 1.0}}, input: {rating: 1.5}) {
        _key
        rating
        name
    }
}
```

Here, we select all documents with a rating less than or equal to 1.0, update the rating value to 1.5, and return all the affected documents `_key`, `rating`, and `name` fields.

For additional filter details, see the above `Query Block` section.
