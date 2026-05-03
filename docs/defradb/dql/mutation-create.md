---
title: Insert new documents
---

Insert is used to create new documents from scratch. This involves many necessary steps to ensure all the data is structured properly and verifiable. From a developer's perspective, it's the easiest of all the mutations as it doesn't require any queries or document lookups before execution.

```graphql
type Book { ... }

mutation {
    create_Book(input: createBookInput) [Book]
}
```

The above example displays the general structure of an insert mutation. You call the `create_TYPE` mutation, with the given input.

## Input Object Type {/* #input-object-type */}

All mutations use a typed input object to update the data.

The following is an example with a full type and input object:

```graphql 
type Book {
    title: String
    description: String
    rating: Float
}

mutation {
    create_Book(input: {
        title: "Painted House",
        description: "The story begins as Luke Chandler ...",
        rating: 4.9
    }) {
        title
        description
        rating
    }
}
```

The above is a simple example of creating a Book using an insert mutation. Additionally, we can see that much like the Query functions, we can select the fields we want to be returned here.

The generated insert mutation returns the same type it creates, in this case, a Book type. So we can easily include all the fields as a selection set so that we can return them.

More specifically, the return type is of type `[Book]`. So we can create and return multiple books at once.
