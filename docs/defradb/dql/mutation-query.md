---
title: Query the database
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

Once you have [created some documents](mutation-create.md), you can query the database for them.

Queries support standard database query operations such as [filtering](filter.md), [sorting](sorting-and-ordering.md), [grouping](grouping.md), [skipping/limiting](limiting-and-pagination.md), [aggregation](aggregate-functions.md), etc. 

<details>
  <summary>Display database setup</summary>
  
  This page assumes your database contains `Book` and `Person` [collections](/schema/collections.md) and some documents in them:

  ```graphql title="Database schema" test-setup-collection
  type Person {
    name: String
    authoredBooks: [Book]
  }

  type Book {
    title: String
    genre: String
    plot: String
    rating: Float
    author: Person
  }
  ```
  ```graphql title="Person documents setup" test-setup-data
  mutation {
    a1:add_Person(input: {
      name: "George Orwell"
    }) { _docID }
    a2:add_Person(input: {
      name: "William Golding"
    }) { _docID }
    a3:add_Person(input: {
      name: "David Foster Wallace"
    }) { _docID }
    a4:add_Person(input: {
      name: "Victor Hugo"
    }) { _docID }
  }
  ```
  ```graphql title="Book documents setup" test-setup-data
  mutation {
    b11:add_Book(input: {
      title: "1984",
      genre: "Fiction",
      plot: "A masterpiece of rebellion and imprisonment where war is peace, freedom is slavery, and Big Brother is watching.",
      rating: 4.20,
      _authorID: "bae-3517d1eb-351b-5231-8387-870893ffb395"
    }) {
      _docID
      title
    }
    b12:add_Book(input: {
      title: "Down and Out in Paris and London",
      genre: "Biography",
      plot: "The adventures of a penniless British writer among the down-and-outs of two great cities.",
      rating: 4.09,
      _authorID: "bae-3517d1eb-351b-5231-8387-870893ffb395"
    }) {
      _docID
      title
    }
    b21:add_Book(input: {
      title: "Lord of the Flies",
      genre: "Fiction",
      plot: "At the dawn of the next world war, a plane crashes on an uncharted island, stranding a group of schoolboys.",
      rating: 3.70,
      _authorID: "bae-78e9c7be-10b9-5673-bad2-da3341367d4b"
    }) {
      _docID
      title
    }
    b31:add_Book(input: {
      title: "Infinite Jest",
      genre: "Fiction",
      plot: "A gargantuan, mind-altering tragi-comedy about the Pursuit of Happiness in America.",
      rating: 4.25
      _authorID: "bae-b59928dc-fd05-5fb7-aea2-9b24af5ebcea"
    }) {
      _docID
      title
    }
    b32:add_Book(input: {
      title: "Consider the Lobster and Other Essays",
      genre: "Nonfiction",
      plot: "Do lobsters feel pain? Did Franz Kafka have a funny bone? What is John Updike's deal, anyway? And what happens when adult video starlets meet their fans in person? Essays that are also enthralling narrative adventures.",
      rating: 4.18,
      _authorID: "bae-b59928dc-fd05-5fb7-aea2-9b24af5ebcea"
    }) {
      _docID
      title
    }
    b41:add_Book(input: {
      title: "Les Misérables",
      genre: "Fiction",
      plot: "Victor Hugo's tale of injustice, heroism and love follows the fortunes of Jean Valjean, an escaped convict determined to put his criminal past behind him.",
      rating: 4.21,
      _authorID: "bae-c169e917-df52-5603-9224-39c1757f1b04"
    }) {
      _docID
      title
    }
  }
  ```
</details>


## Run a query

<Tabs groupId="defra">
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
    ```http title="Retrieve all documents of type Book"
    POST http://localhost:9181/api/v1/graphql HTTP/2
    accept: application/json
    content-type: application/json
    
    {
      "query": "{ Book { _docID title plot } }"
    }
    ```
    :::note
    Newlines are not supported within the `query` string field.
    :::
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

```graphql title="Filter books by genre and author's name"
{
  Books(filter: { 
    genre: { _eq: "Fiction" }, 
    author: { name: { _eq: "George Orwell" } }
  }) {
    title
    plot
    Person {
      name
    }
  }
}
```

GraphQL queries only return the exact fields requested (there is no equivalent of the SQL SELECT * syntax).



## Relationships

The notable distinction of "one-to-one" relationships is that only the DocKey of the corresponding object is stored.

On the other hand, if you simply embed the Address within the Author type without the internal relational system, you can include the `@embed` directive, which will embed it within. Objects embedded inside another using the `@embed` directive do not expose a query endpoint, so they can *only* be accessed through their parent object. Additionally they are not assigned a DocKey.

```graphql
# Get students with their enrolled courses
query {
  Student {
    _docID
    name
    enrollment {
      course {
        title
        code
      }
    }
  }
}
```

```graphql
# Get courses with their enrolled students
query {
  Course {
    _docID
    title
    enrollment {
      student {
        name
        age
      }
    }
  }
}
```

You can also query the join type directly:

```graphql
# Get all enrollments with student and course details
query {
  Enrollment {
    student {
      name
      age
    }
    course {
      title
      code
    }
  }
}
```

DefraDB handles the traversal through the join type automatically, allowing you to express complex many-to-many queries in a single request, but it still must go through the join type.

The join type can also include additional fields specific to the relationship, such as enrollment date, grade, or status:

```graphql
type Enrollment {
  student: Student @relation(name: "student_enrollments")
  course: Course @relation(name: "course_enrollments")
  enrollmentDate: DateTime
  status: String
  grade: Float
}
```


## Use variables

## Run different query parts
```
{
"operationName":"U",
  "query": "query U{ Book { _docID title plot } } query B{ Book { _docID title plot } }"
}
```
