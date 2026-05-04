---
title: Query the database
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

The DefraDB Query Language (DQL) is a [GraphQL](https://graphql.org)-based language for storing and querying data in a DefraDB node.

## Query Block

Query blocks are read-only GraphQL operations designed only to request information from the database, without the ability to mutate the database state. They contain multiple subqueries which are executed concurrently, unless there is some variable dependency between them.

Queries support database query operations such as filtering, sorting, grouping, skipping/limiting, aggregation, etc. These query operations can be used on different GraphQL object levels, mostly on fields that have some relation or embedding to other objects.

<Tabs>
  <TabItem value="cli" label="CLI" default>
    ```shell title="Retrieve all documents of type Book"
    defradb client query '
    {
      Book {
        _docID
        title
        plot
      }
    }
'
```
  </TabItem>
  <TabItem value="http" label="HTTP API">
    ```request title="Retrieve all documents of type Book"
    POST http://localhost:9181/api/v1/graphql
    
    {
      "operationName": "",
      "query": "{ Book { _docID title plot } }",
      "variables": {}
    }
    ```
  </TabItem>
  <TabItem value="graphql" label="GraphQL API">
    ```graphql title="Retrieve all documents of type Book"
    {
      Book {
        _docID
        title
        plot
      }
    }
    ```
  </TabItem>
  <TabItem value="embedded" label="Embedded">
    ```go title="Create a new document of type Book"
    createResult := db.DB.ExecRequest(
        ctx, `
        mutation {
          add_Book(input: {
            title: $title,
            plot: $plot,
            rating: $rating
          })
        }
        `,
        client.WithVariables(map[string]any{
            "title": "Infinite Jest",
            "plot": "A gargantuan, mind-altering tragi-comedy about the Pursuit of Happiness in America.",
            "rating": 4.25,
        }),
    )
    if len(createResult.GQL.Errors) > 0 {
        for _, gqlErr := range createResult.GQL.Errors {
            log.Printf("GraphQL error on create: %v\n", gqlErr)
        }
        log.Fatalf("Failed to create document in DefraDB.")
    }
  ```
  </TabItem>
</Tabs>

```json title="Output"
{
  "data": {
    "Book": [
      {
        "_docID": "bae-546ae840-77c7-51a5-ab0a-b5a893bfa546",
        "plot": "A masterpiece of rebellion and imprisonment where war is peace, freedom is slavery, and Big Brother is watching.",
        "title": "1984"
      },
      {
        "_docID": "bae-6c91c35c-e548-58f8-86a6-d60ab5174072",
        "plot": "At the dawn of the next world war, a plane crashes on an uncharted island, stranding a group of schoolboys.",
        "title": "Lord of the Flies"
      }
    ]
  }
}
```

