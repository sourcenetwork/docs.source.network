---
title: Collections
toc_max_heading_level: 5
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

## Field types {/* #field-types */}

Fields can be of different types:

- `Int`: A signed 32‐bit integer.
- `Float`: A signed double-precision floating-point value.
- `String`: A UTF‐8 character sequence.
- `Boolean`: `true` or `false`.
- `ID`: A unique identifier. Although the `ID` type is serialized in the same way as a `String`, defining it as an ID communicates that it is not intended to be human‐readable.
- `DateTime`: (ex. `2017-07-23T03:46:56.647Z`)
- `JSON`: A JSON string (ex. `{ "privacy": { "is": "sexy" } }`). JSON fields get [specially indexed](indexes.md#json-fields-indexing).
- `Blob`: A hex string (ex. `00FF`).
- List: An array of another type (ex. `[String]`). Lists can not be nested.

In the GraphQL syntax, an exclamation mark `!` appended to a type (ex. `Int!`) in a field definition specifies that the field should be non-null. Although DefraDB does not support non-null scalar types, it does support lists of non-null types. For example:
- `[Int!]` &ndash; Supported: a list of non-null `Int`.
- `[Int]!` &ndash; Unsupported: a non-null list of (possibly null) `Int`.
- `[Int!]!` &ndash; Unsupported: a non-null list of non-null `Int`.

## Create collections {/* #create */}

You can create a collection with either the CLI command [`defradb client collection add`](/references/cli/defradb_client_collection_add.md), the HTTP API endpoint [`/collections`](/defradb/references/http/api/add-collection/), or the method `AddCollection`.

<Tabs groupId="defra">
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
    ```http title="Request"
    POST http://localhost:9181/api/v1/collections HTTP/2
    accept: application/json
    content-type: text/plain

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

### Relationships {/* #relationships */}

To create a relationship between two types, define a field having the other side of the relationship as type.
The way in which you define relationships depends on their kind:

- [One-to-one](#one-to-one) &ndash; Each document of type `A` is linked to one document of type `B`. The same applies in the opposite direction.
- [One-to-many](#one-to-many) &ndash; Each document of type `A` is linked to one document of type `B`. Each document of type `B` is linked to one or more documents of type `A`.
- [Many-to-many](#many-to-many) &ndash; Each document of type `A` is linked to one or more documents of type `B`. The same applies in the opposite direction.

This section shows how to create relationships. For information on how to populate them, see [Create documents with relationships](/dql/mutation-create.md#relationships) and [Query the database](/dql/mutation-query.md#relationships).

:::note
As all other fields, relationship fields can be null. For example, defining a one-to-one relationship doesn't guarantee that each document of type `A` will be linked to a document of type `B`: a document can leave the relationship undefined.
:::

#### One-to-one {/* #relationships-one-to-one */}

One-to-one relationships are such that each document of one type is linked to one and only one document of another type.
In practice, type `A` defines a field of type `B`, and type `B` defines a field of type `A`.

For example, each `Husband` is married to one `Wife` and viceversa (disregarding avant-garde polyamorous relationships):

```graphql title="Type Husband with 1:1 relationship with Wife"
type Husband {
  name: String
  wife: Wife
}

type Wife {
  name: String
  husband: Husband @primary
}
```

The type with the `@primary` directive stores a direct pointer to the other end of the relationship, resulting in faster queries. `@primary` fields also get automatically [indexed](indexes.md). In the example above, `Wife` contains a (implicit) field `_husbandID`, so retrieving a _wife's husband_ is quick. On the other hand, documents of type `Husband` do not contain any pointer to the relative `Wife`, so a collection scan is needed to retrieve a _husband's wife_. Which side should be _primary_ depends on your query patterns.

:::note
One-to-one relationships are enforced via a [unique index](indexes.md#unique-indexes) under the hood. The index must not be dropped, or the 1:1 nature of the relationship will not be fulfilled anymore.
:::

:::warning
There's currently no validation on the type when creating relationships across documents. It is the client's responsibility to validate that the `Wife.husbandID` is populated with the docID of a `Husband` document. It's up to you to marry humans.
:::

#### One-to-many {/* #relationships-one-to-many */}

One-to-many relationships link one document of one type with document of another type, while allowing the other side to be linked to multiple documentes. Type `A` defines a field of type `B`, whereas type `B` defines a field of type `[A]` (_list_ of `A`).

For example, each book is written by one author, whereas one author can write multiple books:

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

:::warning
There's currently no validation on the type when creating relationships across documents. It is the client's responsibility to validate that the `Book.authorID` is populated with the docID of a `Author` document.
:::

#### Many-to-many {/* #relationships-many-to-many */}

Many-to-many relationships link multiple documents of one type to multiple documents of another type, allowing the same on the other side. To create many-to-many relationships, use two [one-to-many relationships](#one-to-many) and a join type.

For example, a student can enroll in many courses, and a course can have many students enrolled:

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

type Enrollment {  # the join type
  student: Student
  course: Course
}
```

#### Define multiple relationship fields of the same type {/* #relationships-rename */}

A type defining multiple relationships to the same type requires extra directives to disambiguate their target. For example, in the scenario in which a book has both an author and a reviewer, the following definitions would be ambiguous:

```graphql title="Invalid &ndash; Ambiguous definition of multiple relationships"
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

At query time, the database cannot infer whether `Person.authoredBooks` is linked to `Person.author` or `Person.reviewer`. To clarify which fields should get paired, use the `@relation(name: String)` directive, coupling each relationship together with the same name:

```graphql title="Valid &ndash; Unambiguous definition of multiple relationships"
type Book {
  title: String
  author: Person @relation(name: "book_author")
  reviewer: Person @relation(name: "book_reviewer")
}

type Person {
  name: String
  authoredBooks: [Book] @relation(name: "book_author")
  reviewedBooks: [Book] @relation(name: "book_reviewer")
}
```

## Show collections {/* #show */}

To see all collections available on an instance, use the CLI command [`defradb client collection describe`](/references/cli/defradb_client_collection_describe.md) or the HTTP API endpoint [`/collections`](/defradb/references/http/api/describe-collection/).

<Tabs groupId="defra">
  <TabItem value="cli" label="CLI" default>
    ```shell
    defradb client collection describe
    ```
    :::tip
    Use the `--name` parameter to restrict the output to a specific collection.
    :::
  </TabItem>
  <TabItem value="http" label="HTTP API">
    ```http title="Request"
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
    "VersionID": "bafyreihqndwux4ewnlvmtcfvptikfvzu76tri2i5x4nbpiqh3hskxmagcm",
    "CollectionID": "bafyreihqndwux4ewnlvmtcfvptikfvzu76tri2i5x4nbpiqh3hskxmagcm",
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
        "FieldID": "bafyreiguuxtuepj5vji3oe5j6lyhwqi5izm4all3gav7ppvgj35hxklrte",
        "Name": "_authorID",
        "Kind": 1,
        "Typ": 1,
        "RelationName": "book_person",
        "IsPrimary": true,
        "DefaultValue": null,
        "Size": 0
      },
      {
        "FieldID": "bafyreibhohsw25uzzzbzs2awta43ql5oo6anry3rxdcuj2n3hlfbjmifse",
        "Name": "author",
        "Kind": {
          "Array": false,
          "CollectionID": "bafyreifilnntrughum4p63ntvocxvwqg2eveymltpziwk7lluvncjftula"
        },
        "Typ": 0,
        "RelationName": "book_person",
        "IsPrimary": true,
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
        "FieldID": "bafyreihfb2izf5akjuua5jkijrgsgievsspboopupjq2its25owgle5pzm",
        "Name": "title",
        "Kind": 11,
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

Truncating a collection means deleting all documents belonging to it, including their histories. It's an irreversible operation that clears the collection's contents entirely.

<Tabs groupId="defra">
  <TabItem value="cli" label="CLI" default>
    Use the CLI commands [`defradb client collection truncate`](/references/cli/defradb_client_collection_truncate.md).  
    For example, to truncate the collection `Book`:
    ```shell
    defradb client collection truncate --collection-id bafyreihqndwux4ewnlvmtcfvptikfvzu76tri2i5x4nbpiqh3hskxmagcm
    ```
  </TabItem>
  <TabItem value="http" label="HTTP API">
    Send a `DELETE` request to the endpoint [`/collections/<name>`](/defradb/references/http/api/delete-collection-with-filter/).  
    For example, to truncate the collection `Book`:
    ```http title="Request"
    DELETE http://localhost:9181/api/v1/collections/Book HTTP/2
    accept: application/json
    content-type: application/json
    
    {}
    ```
  </TabItem>
</Tabs>


## Delete collections {/* #delete */}

The delete command takes one (or more) collection name and erases their schema from the database. Collections linked together through relationships must be deleted together.

<Tabs groupId="defra">
  <TabItem value="cli" label="CLI" default>
    Use the CLI command [`defradb client collection delete`](/references/cli/defradb_client_collection_delete.md) with a comma-separated list of collection names.  
    For example, to delete the collections `Book` and `Person`:
    ```shell
    defradb client collection delete Book,Person
    ```
  </TabItem>
  <TabItem value="http" label="HTTP API">
    Send a `DELETE` request to the endpoint [`/collections/`](/defradb/references/http/api/delete-collection/) with a comma-separated list of collection names in the `name` parameter.  
    For example, to delete the collections `Book` and `Person`:
    ```http title="Request"
    DELETE http://localhost:9181/api/v1/collections/?name=Book,Person HTTP/2
    accept: application/json
    ```
  </TabItem>
</Tabs>

:::note
You can only delete empty collections. If a collection has data, or has had data, you need to [truncate it](#truncate) first. [Deleting documents](/dql/mutation-delete.md) is not equivalent to truncating the collection.
:::
