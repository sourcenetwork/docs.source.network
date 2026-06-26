---
title: Collections
toc_max_heading_level: 5
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

Collections represent groups of documents with similar structures, like tables for SQL databases. The world is chaos, but at least there's collections. Every document created in DefraDB belongs to a collection.

A collection has a name (ex. `Book`) and a number of typed fields (ex. `title: String`).

```graphql title='Example &ndash; Collection "Book"'
type Book {
  title: String
  plot: String
  rating: Float
}
```

## Field types {/* #field-types */}

- `Int`: Signed 32‐bit integer.
- `Float` (alias `Float64`): Signed double-precision floating-point value.
- `Float32`: Signed single-precision floating-point value.
- `String`: UTF‐8 character sequence.
- `Boolean`: `true` or `false`.
- `ID`: Unique identifier.
- `DateTime`: ISO-8601 time (ex. `2017-07-23T03:46:56.647Z`).
- `JSON`: JSON data (ex. `{ privacy: { is: "sexy" } }`). Query filters extend to JSON inner properties if the field is [indexed](indexes.md#json-fields).
- `Blob`: Hex string (ex. `00FF`).
- List: Array of another type (ex. `[String]`). Lists can not be nested.

### Non-null fields

An exclamation mark `!` after a type (ex. `Int!`) specifies that it should be non-null. Also supported with lists:
- `Int!` &ndash; Non-null `Int`.
- `[Int!]` &ndash; List of non-null `Int`.
- `[Int]!` &ndash; Non-null list of (possibly null) `Int`.
- `[Int!]!` &ndash; Non-null list of non-null `Int`.

### Default values

Specify a default value for a field with the `@default` directive. `UTC_NOW` is a special value for the current timestamp.

```graphql
active: Boolean @default(value: true)
creation: DateTime @default(value: UTC_NOW)
```

## Create collections {/* #create */}

<Tabs groupId="defra">
  <TabItem value="cli" label="CLI" default>
    Create a collection with the CLI command [`defradb client collection add`](/references/cli/defradb_client_collection_add.md).

    ```shell title='Create collection "Book"'
    defradb client collection add '
    type Book {
      title: String!
      plot: String
      rating: Float
    }
    '
    ```
    ```json title="Result"
    [
      {
        "Name": "Book",
        "VersionID": "bafyreiasg2fk5b4jmqzoajyjqhmd2m2jmnzlvqnar6llqs5hu34uyh2tdy",
        "CollectionID": "bafyreiasg2fk5b4jmqzoajyjqhmd2m2jmnzlvqnar6llqs5hu34uyh2tdy",
        "CollectionSet": null,
        "Query": null,
        "PreviousVersion": null,
        "Fields": [
          {
            "FieldID": "bafyreihqzhiz3iwro4jozp6kphq4sosg6ccoqcbiaf7rg5dmvea7aux55a",
            "Name": "_docID",
            "Kind": 1,
            "Typ": 0,
            "RelationName": null,
            "IsPrimary": false,
            "DefaultValue": null,
            "Size": 0
          },
          {
            "FieldID": "bafyreibxx5wzp4iagt3jifid2r7hfzvbtzp2fuq26vku6t6ptk3ppwgxl4",
            "Name": "plot",
            "Kind": 11,
            "Typ": 1,
            "RelationName": null,
            "IsPrimary": false,
            "DefaultValue": null,
            "Size": 0
          },
          {
            "FieldID": "bafyreibbxpehr5radbbkkmsau5uuscoif4dxu6j3ef4by6f445fyx7pl3y",
            "Name": "rating",
            "Kind": 6,
            "Typ": 1,
            "RelationName": null,
            "IsPrimary": false,
            "DefaultValue": null,
            "Size": 0
          },
          {
            "FieldID": "bafyreifhl4p32tbcum4353gigaz7cqrribrgxlbzbps7ec24i5ydxoxewm",
            "Name": "title",
            "Kind": 26,
            "Typ": 1,
            "RelationName": null,
            "IsPrimary": false,
            "DefaultValue": null,
            "Size": 0
          }
        ],
        "Indexes": [],
        "EncryptedIndexes": [],
        "Policy": null,
        "IsActive": true,
        "IsMaterialized": true,
        "IsBranchable": false,
        "IsEmbeddedOnly": false,
        "IsPlaceholder": false,
        "VectorEmbeddings": []
      }
    ]
    ```
  </TabItem>
  <TabItem value="http" label="HTTP API">
  Create a collection by submitting a `POST` request to the HTTP endpoint [`/collections`](/defradb/references/http/api/add-collection/).

    ```http title='Create collection "Book"'
    POST http://localhost:9181/api/v1/collections HTTP/2
    accept: application/json
    content-type: text/plain

    type Book {
      title: String!
      plot: String
      rating: Float
    }
    ```
    ```json title="Result"
    [
      {
        "Name": "Book",
        "VersionID": "bafyreiasg2fk5b4jmqzoajyjqhmd2m2jmnzlvqnar6llqs5hu34uyh2tdy",
        "CollectionID": "bafyreiasg2fk5b4jmqzoajyjqhmd2m2jmnzlvqnar6llqs5hu34uyh2tdy",
        "CollectionSet": null,
        "Query": null,
        "PreviousVersion": null,
        "Fields": [
          {
            "FieldID": "bafyreihqzhiz3iwro4jozp6kphq4sosg6ccoqcbiaf7rg5dmvea7aux55a",
            "Name": "_docID",
            "Kind": 1,
            "Typ": 0,
            "RelationName": null,
            "IsPrimary": false,
            "DefaultValue": null,
            "Size": 0
          },
          {
            "FieldID": "bafyreibxx5wzp4iagt3jifid2r7hfzvbtzp2fuq26vku6t6ptk3ppwgxl4",
            "Name": "plot",
            "Kind": 11,
            "Typ": 1,
            "RelationName": null,
            "IsPrimary": false,
            "DefaultValue": null,
            "Size": 0
          },
          {
            "FieldID": "bafyreibbxpehr5radbbkkmsau5uuscoif4dxu6j3ef4by6f445fyx7pl3y",
            "Name": "rating",
            "Kind": 6,
            "Typ": 1,
            "RelationName": null,
            "IsPrimary": false,
            "DefaultValue": null,
            "Size": 0
          },
          {
            "FieldID": "bafyreifhl4p32tbcum4353gigaz7cqrribrgxlbzbps7ec24i5ydxoxewm",
            "Name": "title",
            "Kind": 26,
            "Typ": 1,
            "RelationName": null,
            "IsPrimary": false,
            "DefaultValue": null,
            "Size": 0
          }
        ],
        "Indexes": [],
        "EncryptedIndexes": [],
        "Policy": null,
        "IsActive": true,
        "IsMaterialized": true,
        "IsBranchable": false,
        "IsEmbeddedOnly": false,
        "IsPlaceholder": false,
        "VectorEmbeddings": []
      }
    ]
    ```
  </TabItem>
</Tabs>

### Relationships {/* #relationships */}

To create a relationship between two types, define a field having the other side of the relationship as type.
The way in which you define relationships depends on their kind:

- [One-to-one](#one-to-one) &ndash; Each document of type `A` is linked to one document of type `B`, and viceversa.
- [One-to-many](#one-to-many) &ndash; Each document of type `A` is linked to one document of type `B`. Each document of type `B` is linked to one or more documents of type `A`.
- [Many-to-many](#many-to-many) &ndash; Each document of type `A` is linked to one or more documents of type `B`, and viceversa.

This section shows how to create relationships. For information on how to populate and query them, see [Create documents with relationships](/dql/mutation-create.md#relationships) and [Query the database](/dql/mutation-query.md#relationships).

:::note
As all other fields, relationship fields can be null. For example, defining a one-to-one relationship doesn't guarantee that each document of type `A` will be linked to a document of type `B`: a document can leave the relationship undefined.
:::

#### One-to-one {/* #relationships-one-to-one */}

One-to-one relationships are such that each document of type `A` is linked to one and only one document of type `B`.
In practice, type `A` defines a field of type `B`, and type `B` defines a field of type `A`.

For example, each `Husband` is married to one `Wife` and viceversa. At least disregarding avant-garde polyamorous relationships.

```graphql title='Type "Husband" with 1:1 relationship with "Wife"'
type Husband {
  name: String
  wife: Wife
}

type Wife {
  name: String
  husband: Husband @primary
}
```

The type holding the `@primary` directive stores a direct pointer to the other end of the relationship, resulting in faster queries. `@primary` fields also get automatically [indexed](indexes.md). In the example above, `Wife` contains a (implicit) field `_husbandID`, so retrieving a _wife's husband_ is quick. On the other hand, documents of type `Husband` do not contain any pointer to the relative `Wife`, so a collection scan is needed to retrieve a _husband's wife_. Wifes are just harder to find. Which side should have the `@primary` directive depends on your query patterns.

:::note
One-to-one relationships are enforced via [unique indexes](indexes.md#unique) under the hood. The index must not be dropped, or the 1:1 nature of the relationship will not be fulfilled anymore.
:::

:::warning
There's no validation on the type when creating relationships across documents. It is the client's responsibility to validate that the `Wife.husbandID` is populated with the docID of a `Husband` document. It's up to you to marry humans.
:::

#### One-to-many {/* #relationships-one-to-many */}

One-to-many relationships link one document of type `A` with one document of type `B`, but allows documents of type `B` to be linked to multiple documents of type `A`. In practice, type `A` defines a field of type `B`, whereas type `B` defines a field of type `[A]` (_list_ of `A`).

For example: each book has one author, whereas one person can author multiple books:

```graphql title='Type "Book" with 1:many relationship with "Person"'
type Book {
  title: String!
  author: Person
}

type Person {
  name: String!
  authoredBooks: [Book]
}
```

:::warning
There's no validation on the type when creating relationships across documents. It is the client's responsibility to validate that the `Book.authorID` is populated with the docID of a `Person` document.
:::

#### Many-to-many {/* #relationships-many-to-many */}

Many-to-many relationships link multiple documents of one type to multiple documents of another type, allowing the same on the other side. To create many-to-many relationships, use two [one-to-many relationships](#one-to-many) and a join type.

For example: a student can enroll in many courses, and a course can have many students enrolled:

```graphql title='Type "Student" with many:many relationship with "Course"'
type Student {
  name: String!
  age: Int
  enrollment: [Enrollment]
}

type Course {
  title: String!
  code: String!
  enrollment: [Enrollment]
}

type Enrollment {  # the join type
  student: Student!
  course: Course!
}
```

#### Multiple relationships of same type {/* #relationships-rename */}

A type defining multiple relationships to the same type requires extra directives to disambiguate their targets. For example, if a book has both an author and a reviewer, the following definitions would be ambiguous:

```graphql title="Invalid &ndash; Ambiguous definition of multiple relationships" test-fail
# invalid
type Book {
  title: String
  author: Person
  reviewer: Person
}

type Person {
  name: String
  authoredBooks: [Book]
  reviewedBooks: [Book]
}
```

At query time, the database cannot infer whether `Person.authoredBooks` is linked to `Book.author` or `Book.reviewer`. To clarify which fields should get paired, use the `@relation(name: String)` directive, coupling each relationship together with the same name:

```graphql title="Valid &ndash; Unambiguous definition of multiple relationships"
# valid
type Book {
  title: String
  author: Person @relation(name: "author")
  reviewer: Person @relation(name: "reviewer")
}

type Person {
  name: String
  authoredBooks: [Book] @relation(name: "author")
  reviewedBooks: [Book] @relation(name: "reviewer")
}
```

## Show collections {/* #show */}

<Tabs groupId="defra">
  <TabItem value="cli" label="CLI" default>
    Show the collections available on an instance with the CLI command [`defradb client collection describe`](/references/cli/defradb_client_collection_describe.md).

    ```shell title="Show all collections"
    defradb client collection describe
    ```
    :::tip
    Use the `--name` parameter to restrict the output to a specific collection.
    :::
  </TabItem>
  <TabItem value="http" label="HTTP API">
    Show the collections available on an instance by submitting a `GET` request to the HTTP endpoint [`/collections`](/defradb/references/http/api/describe-collection/).

    ```http title="Show all collections"
    GET http://localhost:9181/api/v1/collections HTTP/2
    accept: application/json
    ```
    :::tip
    Use the `name` parameter to restrict the output to a specific collection.
    :::
  </TabItem>
</Tabs>

```json title="Result"
[
  {
    "Name": "Book",
    "VersionID": "bafyreiasg2fk5b4jmqzoajyjqhmd2m2jmnzlvqnar6llqs5hu34uyh2tdy",
    "CollectionID": "bafyreiasg2fk5b4jmqzoajyjqhmd2m2jmnzlvqnar6llqs5hu34uyh2tdy",
    "CollectionSet": null,
    "Query": null,
    "PreviousVersion": null,
    "Fields": [
      {
        "FieldID": "bafyreihqzhiz3iwro4jozp6kphq4sosg6ccoqcbiaf7rg5dmvea7aux55a",
        "Name": "_docID",
        "Kind": 1,
        "Typ": 0,
        "RelationName": null,
        "IsPrimary": false,
        "DefaultValue": null,
        "Size": 0
      },
      {
        "FieldID": "bafyreibxx5wzp4iagt3jifid2r7hfzvbtzp2fuq26vku6t6ptk3ppwgxl4",
        "Name": "plot",
        "Kind": 11,
        "Typ": 1,
        "RelationName": null,
        "IsPrimary": false,
        "DefaultValue": null,
        "Size": 0
      },
      {
        "FieldID": "bafyreibbxpehr5radbbkkmsau5uuscoif4dxu6j3ef4by6f445fyx7pl3y",
        "Name": "rating",
        "Kind": 6,
        "Typ": 1,
        "RelationName": null,
        "IsPrimary": false,
        "DefaultValue": null,
        "Size": 0
      },
      {
        "FieldID": "bafyreifhl4p32tbcum4353gigaz7cqrribrgxlbzbps7ec24i5ydxoxewm",
        "Name": "title",
        "Kind": 26,
        "Typ": 1,
        "RelationName": null,
        "IsPrimary": false,
        "DefaultValue": null,
        "Size": 0
      }
    ],
    "Indexes": [],
    "EncryptedIndexes": [],
    "Policy": null,
    "IsActive": true,
    "IsMaterialized": true,
    "IsBranchable": false,
    "IsEmbeddedOnly": false,
    "IsPlaceholder": false,
    "VectorEmbeddings": []
  }
]
```

## Truncate collections {/* #truncate */}

Truncating a collection means deleting all documents belonging to it, including their histories. It's an **irreversible operation** that clears the collection's contents entirely.

<Tabs groupId="defra">
  <TabItem value="cli" label="CLI" default>
    Truncate a collection with the CLI command [`defradb client collection truncate`](/references/cli/defradb_client_collection_truncate.md).

    ```shell title='Truncate collection "Book"'
    defradb client collection truncate --name Book
    ```
  </TabItem>
  <TabItem value="http" label="HTTP API">
    Truncate a collection by submitting a `DELETE` request to the HTTP endpoint [`/collections/<name>`](/defradb/references/http/api/delete-collection-with-filter/), where `<name>` is a collection name.
    
    ```http title='Truncate collection "Book"'
    DELETE http://localhost:9181/api/v1/collections/Book HTTP/2
    accept: application/json
    content-type: application/json
    ```
  </TabItem>
</Tabs>


## Delete collections {/* #delete */}

The delete command takes one or more collection names and erases their schema from the database. Collections linked together through relationships must be deleted together.

<Tabs groupId="defra">
  <TabItem value="cli" label="CLI" default>
    Delete a collection with the CLI command [`defradb client collection delete`](/references/cli/defradb_client_collection_delete.md), providing a comma-separated list of collection names.  
    
    ```shell title='Delete collections "Book" and "Person"'
    defradb client collection delete Book,Person
    ```
  </TabItem>
  <TabItem value="http" label="HTTP API">
    Delete a collection by submitting a `DELETE` request to the HTTP endpoint [`/collections/`](/defradb/references/http/api/delete-collection/), providing a comma-separated list of collection names in the `name` parameter.  
    
    ```http title='Delete collections "Book" and "Person"'
    DELETE http://localhost:9181/api/v1/collections?name=Book,Person HTTP/2
    accept: application/json
    ```
  </TabItem>
</Tabs>

:::note
You can only delete empty collections. If a collection has data, or *has had* data (and thus has history), you need to [truncate it](#truncate) first. [Deleting documents](/dql/mutation-delete.md) is not equivalent to truncating the collection.
:::
