---
title: Create database collections
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

Collections represent groups of documents with similar structures, like tables for SQL databases. They create structure in an otherwise chaotic world. Every document created in DefraDB belongs to a collection.

A collection has a name (ex. `Book`) and a number of fields (ex. `title`, `plot`, `rating`).

```graphql title="An example collection"
type Book {
  title: String!
  plot: String!
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
- `JSON`: A JSON string (ex. `{ "privacy": {"is": "sexy"} }`).
- `Blob`: A hex string (ex. `00FF`).
- List: An array of another type (ex. `[String]`). Lists can be nested (ex. `[[String]]`).

To specify that a field should be Non-Null, append an exclamation mark `!` after its type (ex. `Int!`). The Non-Null modifier can be used with lists with different behaviors:

- `[Int!]`: A list of Non-Null `Int`.
- `[Int]!`: A Non-Null list of (possibly Null) `Int`.
- `[Int!]!`: A Non-Null list of Non-Null `Int`.

## Create collections

To create a collection you can use either the CLI command [`defradb client collection add`](/references/cli/defradb_client_collection_add.md), the HTTP API endpoint [`/collections`](/defradb/references/http/api/add-collection/), or the method `AddCollection`.

<Tabs>
  <TabItem value="cli" label="CLI" default>
    ```shell
    defradb client collection add '
      type Book {
        title: String!
        plot: String!
        rating: Float
      }
    '
    ```
  </TabItem>
  <TabItem value="http" label="HTTP API">
    ```request title="Request"
    POST http://localhost:9181/api/v1/collections

    type Book {
      title: String!
      plot: String!
      rating: Float
    }
    ```
  </TabItem>
  <TabItem value="embedded" label="Embedded">
    ```go
    // import "github.com/sourcenetwork/defradb/cbindings"

    _, err = db.DB.AddSchema(ctx, `type Book {
      title: String!
      plot: String!
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

```graphql title="A Book type with field author of type Person"
type Person {
  name: String
}

type Book {
  title: String!
  plot: String!
  rating: Float
  author: Person
}
```

```graphql title="A Book type with field genre of type [Genre!]"
defradb client collection add '
type Genre {
  name: String
}

type Book {
  title: String
  plot: String
  rating: Float
  genre: Genre
}
'
```
