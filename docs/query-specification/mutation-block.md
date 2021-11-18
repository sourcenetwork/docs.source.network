---
sidebar_label: Mutation Block
sidebar_position: 150
---
<<<<<<< HEAD
# Mutation Block
=======
# Mutation Block

Mutations are the `write` side of the DefraDB Query Language. Mutations rely on the query system to properly function, as updates, upserts, and deletes all require filtering and finding data before taking action. 

The data and payload format that mutations use is fundemental to maintaining the designed structure of the database.

All mutation definitions are generated for each defined type in the Database. This is similar to the read query system.

Mutations are similar to SQL `INSERT INTO ...` or `UPDATE` statements.

Much like the Query system, all mutations exist inside a `mutation { ... }` block. Several mutations can be run at the same time, independently of one another.

#### Insert
Insert is used to create new documents from scratch, which involves many necessary steps to ensure all the data is structured properly and verifiable. From a developer's perspective, it's the easiest of all the mutations as it doesn't require any queries or document lookups before execution.

```javascript=
type Book { ... }
mutation {
    createBook(data: createBookPayload) [Book]
}
```

This is the general structure of an insert mutation. You call the `createTYPE` mutation, with the given data payload.

##### Payload Format
All mutations use a payload to update the data. Unlike the rest of the Query system, mutation payloads aren't typed. Instead, they use a standard JSON Serialization format.

Removing the type system from payloads allows flexibility in the system.

JSON Supports all the same types as DefraDB, and it's familiar for developers, so i's an obvious choice for us.

Here's an example with a full type and payload
```javascript 
type Book {
    title: String
    description: String
    rating: Float
}

mutation {
    createBook(data: "{
        'title': 'Painted House',
        'description': 'The story begins as Luke Chandler ...',
        'rating': 4.9
    }") {
        title
        description
        rating
    }
}
```

Here we can see how a simple example of creating a Book using an insert mutation. Additionally, we can see, much like the Query functions, we can select the fields we want to be returned.

The generated insert mutation returns the same type it creates, in this case, a Book type. So we can easily include all the fields as a selection set so that we can return them. 

More specifically, the return type is of type `[Book]`. So we can create and return multiple books at once.

#### Update
Updates are distinct from Inserts in several ways. Firstly, it relies on a query to select the correct document or documents to update. Secondly it uses a different payload system.

Update filters use the same format and types from the Query system, so it easily transferable.

Heres the structure of the generated update mutation for a `Book` type.
```javascript
mutation {
    update_book(id: ID, filter: BookFilterArg, data: updateBookPayload) [Book]
}
```

See above for the structure and syntax of the filter query. You can also see an additional field `id`, that will supersede the `filter`; this makes it easy to update a single document by a given ID.

More importantly than the Update filter, is the update payload. Currently all update payloads use the `JSON Merge Patch` system.

`JSON Merge Patch` is very similar to a traditional JSON object, with a few semantic differences that are important for Updates. Most significantly is how to remove or delete a field value in a document. To remove a `JSON Merge Patch` field. we provide a `nil` value in the JSON object.

Here's an example.
```json
{
    "name": "John",
    "rating": nil
}
```

This Merge Patch sets the `name` field to "John" and deletes the `rating` field value.

Once we create our update , and select which document(s) to update, we can query the new state of all documents affected by the mutation. This is because our update mutation returns the type it mutates.

Heres a basic example
```javascript
mutation {
    update_book(id: '123', data: "{'name': 'John'}") {
        _key
        name
    }
}

```

Here we can see after applying the mutation; we return the `_key` and `name` fields. We can return any field from the document, not just the ones updated. We can even return and filter on related types.

Beyond, updating by an ID or IDs, we can use a query filter to select which fields to apply our update to. This filter works the same as the queries.

```javascript
mutation {
    update_book(filter: {rating: {_le: 1.0}}, data: "{'rating': '1.5'}") {
        _key
        rating
        name
    }
}
```

Here, we select all documents with a rating less than or equal to 1.0, update the rating value to 1.5, and return all the affected documents `_key`, `rating`, and `name` fields.

For additional filter details, see the above `Query Block` section.

<!--

First, raw JSON lacks the intention of the update, meaning, it can be ambigious what a given value in a JSON document is supposed to do in the context of an *update*. Its easy for *insert* since theres a direct correspondance between the raw JSON, and the intended document value.

As a solution, both `Update` and `Upsert` payload use a combination of `JSON PATCH` and `JSON MERGE PATCH`. Despite their similar sounding names, a patch and a merge patch are entirely different. 

We won't go into extreme detail between the two formats, however we will list their intended goals, usage, and how they relate to DefraDB.
-->



<!--
##### JSON PATCH
For updates that wish to be as precise as possible, with no chance of ambiguity in the target document result after the update, one should use the `JSON PATCH`. Patches allow the user to explicitly list an array of all the changes they want to be made, where each element in the array is a `JSON PATCH Operation`.

The following is a simple `JSON PATCH` example

```json
[
    { "op": "add", "path": "/a", "value": "foo" }
]
```

Here, we simply `add` the value *foo* to the key */a*. 

However, `JSON PATCH` can be much more expressive. There are several *operation* types. The following is all the availble supported patch operations: "add", "remove", "replace", "move", "copy".

A valid Patch object is an array at the root of the JSON object, followed by one or more operation objects. You can refence below to see how each operation works, and what its behavior is.

Here's a full example for an Update Mutation using the JSON PATCH encoding. We will update all books with a rating higher then 4.5, by adding the "TopRated" to its genre list, and returning all the DocKeys and names of the updated docs.
```javascript
type Book {
    title: String
    description: String
    rating: Float
    verified: Boolean
    genres: [string]
}

mutation {
    updateBook(filter: {rating: {_ge: 4.5}}, data: "[
        {'op': 'add', 'path': '/genres', 'value': 'TopRated'}
    ]") {
        _key
        title
    }
}
```

The benefit of the `JSON PATCH` approach here is the precision of indicating we want to add the 'TopRated' value to the genres array, without needing to know what is in the array. 

###### Add
The "add" operation performs one of the following functions, depending upon what the target location references:
 - If the target location specifies an array index, a new value is inserted into the array at the specified index.
 - If the target location specifies an object member that does not already exist, a new member is added to the object.
 - If the target location specifies an object member that does exist, that member's value is replaced.

The operation object MUST contain a "value" member whose content specifies the value to be added.

###### Remove
The "remove" operation removes the value at the target location. The target location MUST exist for the operation to be successful.

For example:

```json
   { "op": "remove", "path": "/a/b/c" }
```

If removing an element from an array, any elements above the specified index are shifted one position to the left.

###### Replace

The "replace" operation replaces the value at the target location with a new value.  The operation object MUST contain a "value" member whose content specifies the replacement value.

The target location MUST exist for the operation to be successful.

For example:

```json
    { "op": "replace", "path": "/a/b/c", "value": 42 }
```

This operation is functionally identical to a "remove" operation for a value, followed immediately by an "add" operation at the same location with the replacement value.

###### Move

The "move" operation removes the value at a specified location and adds it to the target location.

The operation object MUST contain a "from" member, which is a string containing a JSON Pointer value that references the location in the target document to move the value from.

The "from" location MUST exist for the operation to be successful.

For example:

```json
    { "op": "move", "from": "/a/b/c", "path": "/a/b/d" }
```

This operation is functionally identical to a "remove" operation on the "from" location, followed immediately by an "add" operation at the target location with the value that was just removed.



###### Copy
The "copy" operation copies the value at a specified location to the target location.

The operation object MUST contain a "from" member, which is a string containing a JSON Pointer value that references the location in the target document to copy the value from.

The "from" location MUST exist for the operation to be successful.

For example:
```json
    { "op": "copy", "from": "/a/b/c", "path": "/a/b/e" }
```

This operation is functionally identical to an "add" operation at the
target location using the value specified in the "from" member.

-->

#### Upsert
![](https://img.shields.io/badge/Status-TODO-yellow)

#### Delete
Delete mutations allow developers and users to remove objects from collections. You can delete using specific Document Keys, a list of doc keys, or a filter statement.

The document selection interface is identical to the `Update` system. Much like the update system, we can return the fields of the deleted documents.

Heres the structure of the generated delete mutation for a `Book` type.
```javascript
mutation {
    delete_book(id: ID, ids: [ID], filter: BookFilterArg) [Book]
}
```

Here we can delete a document with ID '123':
```javascript
mutation {
    delete_user(id: '123') {
        _key
        name
    }
}
```

This will delete the specific document, and return the `_key` and `name` for the deleted document.

DefraDB currently uses a Hard Delete system, which means that it is completely removed from the database when a document is deleted.

Similar to the Update system, you can use a filter to select which documents to delete.
```javascript
mutation {
    delete_user(filter: {rating: {_gt: 3}}) {
        _key
        name
    }
}
```

Here we delete all the matching documents (documents with a rating greater than 3).
>>>>>>> 0c435cfc9047efae6c56574bbabd6af493514f45
