---
title: Delete documents
---

Deleting mutations allow developers and users to remove objects from collections. You can delete using specific Document Keys, a list of doc keys, or a filter statement.

The document selection interface is identical to the `Update` system. Much like the update system, we can return the fields of the deleted documents.

The structure of the generated delete mutation for a `Book` type is given below:
```graphql
mutation {
    delete_Book(docID: ID, ids: [ID], filter: BookFilterArg) [Book]
}
```

Here, we can delete a document with ID '123':
```graphql
mutation {
    delete_User(docID: '123') {
        _key
        name
    }
}
```

This will delete the specific document, and return the `_key` and `name` for the deleted document.

DefraDB currently uses a Hard Delete system, which means that when a document is deleted, it is completely removed from the database.

Similar to the Update system, you can use a filter to select which documents to delete, as shown below:

```graphql
mutation {
    delete_User(filter: {rating: {_gt: 3}}) {
        _key
        name
    }
}
```

Here, we are deleting all the matching documents (documents with a rating greater than 3).
