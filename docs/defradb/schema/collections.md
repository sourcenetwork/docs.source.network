---
title: Create database collections
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

Collections represent groups of documents with similar structures, like tables for SQL databases. They create structure in an otherwise chaotic world. Every document created in DefraDB belongs to a collection.

A collection has a name (ex. `Book`) and a number of typed fields (ex. `title: String`).

```graphql title="An example collection"
type Book {
  title: String
  plot: String
  rating: Float
}
```

## Field types

Fields can be of different types:

- `Int`: A signed 32‐bit integer.
- `Float`: A signed double-precision floating-point value.
- `String`: A UTF‐8 character sequence.
- `Boolean`: `true` or `false`.
- `ID`: A unique identifier. Although the `ID` type is serialized in the same way as a `String`, defining it as an ID communicates that it is not intended to be human‐readable.
- `DateTime`: (ex. `2017-07-23T03:46:56.647Z`)
- `JSON`: A JSON string (ex. `{ "privacy": {"is": "sexy"} }`). JSON fields get [specially indexed](indexes.md#json-fields-indexing).
- `Blob`: A hex string (ex. `00FF`).
- List: An array of another type (ex. `[String]`). Lists can not be nested.

{/*
To specify that a field should be Non-Null, append an exclamation mark `!` after its type (ex. `Int!`). The Non-Null modifier can be used with lists with different behaviors:

- `[Int!]`: A list of Non-Null `Int`.
- `[Int]!`: A Non-Null list of (possibly Null) `Int`.
- `[Int!]!`: A Non-Null list of Non-Null `Int`.
*/}

## Create collections

You can create a collection with either the CLI command [`defradb client collection add`](/references/cli/defradb_client_collection_add.md), the HTTP API endpoint [`/collections`](/defradb/references/http/api/add-collection/), or the method `AddCollection`.

<Tabs>
  <TabItem value="cli" label="CLI" default>
    ```shell
    defradb client collection add '
      type Book {
        title: String
        plot: String
        rating: Float
      }
    '
    ```
  </TabItem>
  <TabItem value="http" label="HTTP API">
    ```request title="Request"
    POST http://localhost:9181/api/v1/collections

    type Book {
      title: String
      plot: String
      rating: Float
    }
    ```
  </TabItem>
  <TabItem value="embedded" label="Embedded">
    ```go
    _, err = db.DB.AddCollection(ctx, `type Book {
      title: String
      plot: String
      rating: Float
    }`)
    if err != nil {
        // Fails for example if the collection is already added
        log.Fatalf("Failed to add collection: %v", err)
    }
  ```
  </TabItem>
</Tabs>

For more information, see [GraphQL -> Schemas and Types](https://graphql.org/learn/schema/).

## Relationships

To create a relationship between two types, define a field having the other side of the relationship as type.

The way in which you define relationships depends on their kind:

- [One-to-one](#one-to-one) &ndash; Each document of one type is linked to one and only one document of the other type.
- [One-to-many](#one-to-many) &ndash; Each document of one type is linked to multiple documents of the other type.
- [Many-to-many](#many-to-many) &ndash; Each document of one type is linked to multiple documents of the other type.

### One-to-one

One-to-one relationships are such that each document of one type is linked to one and only one document of another type. They are defined by two types each having a field carrying the other type. For example, there's a one-to-one relationship between `Husband` and `Wife` (disregarding avant-garde polyamorous relationships).

```graphql title="Type Husband with 1:1 relationship with Wife"
type Husband {
  name: String
  wife: Wife
}

type Wife {
  name: String
  husband: Husband @primary @index(unique: true)
}
```

- `@primary` &ndash; This side stores a direct pointer to the other end of the relationship, resulting in faster queries. In the example above, `Wife` contains a (implicit) field `_husbandID`, so retrieving a _wife's husband_ is quick. On the other hand, documents of type `Husband` do not contain any pointer to the relative `Wife`, so a collection scan is needed to retrieve a _husband's wife_. Which side should be _primary_ depends on your query patterns.
- `index(unique: true)` &ndash; Creates a [unique index](indexes.md#unique-indexes) on `_husbandID`, making the relationship one-to-one.

### One-to-many

One-to-many relationships link one document of one type with many documents of another type. One side defines a field of the other type, whereas the other type defines a field of _list_ of the first type. For example, each book is written by one author, whereas one author can write multiple books.

```graphql title="Type Book with 1:many relationship with Author"
type Book {
  title: String
  author: Author
}

type Author {
  name: String
  authoredBooks: [Book]
}
```

### Many-to-many

Many-to-many relationships link multiple documents of one type to multiple documents of another type. In DefraDB, you achieve this with two [one-to-many relationships](#one-to-many) and a join type. For example, a student can enroll in many courses, and a course can have many students enrolled.

```graphql title="Type Student with many:many relationship with Course"
type Student {
  name: String
  age: Int
  enrollment: [Enrollment]
}

type Course {
  title: String
  code: String
  enrollment: [Enrollment]
}

type Enrollment {
  student: Student
  course: Course
}
```

### Rename a relationship field

By default, 

```graphql title="Type Husband with 1:1 relationship with Wife"
type Husband {
  name: String
  wife: Wife
}

type Wife {
  name: String
  husband: Husband @primary @index(unique: true)
}
```
