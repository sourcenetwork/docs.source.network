---
title: Create new documents
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

Once you have [created collections](/collections/create.md), you can start inserting documents into them. This page assumes your database contains `Book` and `Person` collections:

```graphql title="Database schema"
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

The mutation `create_<collection>` allows you to create a new document 

<Tabs>
  <TabItem value="cli" label="CLI" default>
    ```shell title="Create a new document of type Book"
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
    ```request title="Create a new document of type Book"
    POST http://localhost:9181/api/v1/collections/Book
    
    {
      "title": "Infinite Jest",
      "plot": "A gargantuan, mind-altering tragi-comedy about the Pursuit of Happiness in America.",
      "rating": 4.25
    }
    ```
  </TabItem>
  <TabItem value="graphql" label="GraphQL API">
    ```graphql title="Create a new document of type Book"
    mutation {
      add_Book(input: {
        title: "Infinite Jest",
        plot: "A gargantuan, mind-altering tragi-comedy about the Pursuit of Happiness in America.",
        rating: 4.25
      })
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

return fields after creating

```graphql title="Create a new document"
mutation {
  add_Book(input: {
    title: "Infinite Jest",
    plot: "A gargantuan, mind-altering tragi-comedy about the Pursuit of Happiness in America.",
    rating: 4.25
  }) {
    title
    description
  }
}
```

can create and return multiple books at once

```graphql title="Create a new document"
mutation {
  b1:add_Book(input: {
    title: "1984",
    plot: "A masterpiece of rebellion and imprisonment where war is peace, freedom is slavery, and Big Brother is watching.",
    rating: 4.20
  }) {
    title
  }
  b2:add_Book(input: {
    title: "Lord of the Flies",
    plot: "At the dawn of the next world war, a plane crashes on an uncharted island, stranding a group of schoolboys.",
    rating: 3.70
  }) {
    title
  }
}
```

```text
{
  "data": {
    "b1": [
      {
        "title": "1984"
      }
    ],
    "b2": [
      {
        "title": "Lord of the Flies"
      }
    ]
  }
}
```

to add with relationships

```graphql title="Create a new document"
mutation {
  v:add_Person(input: {
    name: Victor Hugo
  }
  b:add_Book(input: {
    title: "Les Misérables",
    plot: "Victor Hugo's tale of injustice, heroism and love follows the fortunes of Jean Valjean, an escaped convict determined to put his criminal past behind him.",
    rating: 4.21
    author: v
  }) {
    title
    author
  }
}
```
