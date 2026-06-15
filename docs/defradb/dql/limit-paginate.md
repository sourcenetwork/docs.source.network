---
title: Limit and paginate results
---

There's no limit on the amount of data you can store in DefraDB, and thus there's no limit on how many results DefraDB will return when querying it. Things can get overwhelming quite quickly &ndash; before you realize, you might drown in your own data.

The `limit` and `offset` keywords allow you to control how many records a query will return. You can combine them to create a pagination system.

<details>
  <summary>Display database setup</summary>
  
  This page assumes your database contains `Book` and `Person` [collections](/schema/collections.md) and some documents in them:

  ```graphql title="Database schema" test-setup-collection
  type Person {
    name: String!
    authoredBooks: [Book]
  }

  type Book {
    title: String!
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


## Limit results (`limit`)

With the `limit` keyword you can specify the maximum number of records to return from a query's result set.

```graphql title="Get the 3 top-rated books"
{
  # highlight-next-line
  Book(order: { rating: DESC }, limit: 3) {
    title
    plot
    rating
  }
}
```
```json title="Result"
{
  "data": {
    "Book": [
      {
        "plot": "A gargantuan, mind-altering tragi-comedy about the Pursuit of Happiness in America.",
        "rating": 4.25,
        "title": "Infinite Jest"
      },
      {
        "plot": "Victor Hugo's tale of injustice, heroism and love follows the fortunes of Jean Valjean, an escaped convict determined to put his criminal past behind him.",
        "rating": 4.21,
        "title": "Les Misérables"
      },
      {
        "plot": "A masterpiece of rebellion and imprisonment where war is peace, freedom is slavery, and Big Brother is watching.",
        "rating": 4.2,
        "title": "1984"
      }
    ]
  }
}
```

## Skip results (`offset`)

With the `offset` keyword you can specify how many records to be skipped in the result set. The database will return records after the given `offset` number.

```graphql title="Get the 3 top-rated books after the first 2"
{
  # highlight-next-line
  Book(order: { rating: DESC }, limit: 3, offset: 2) {
    title
    plot
    rating
  }
}
```
```json title="Result"
{
  "data": {
    "Book": [
      {
        "plot": "A masterpiece of rebellion and imprisonment where war is peace, freedom is slavery, and Big Brother is watching.",
        "rating": 4.2,
        "title": "1984"
      },
      {
        "plot": "Do lobsters feel pain? Did Franz Kafka have a funny bone? What is John Updike's deal, anyway? And what happens when adult video starlets meet their fans in person? Essays that are also enthralling narrative adventures.",
        "rating": 4.18,
        "title": "Consider the Lobster and Other Essays"
      },
      {
        "plot": "The adventures of a penniless British writer among the down-and-outs of two great cities.",
        "rating": 4.09,
        "title": "Down and Out in Paris and London"
      }
    ]
  }
}
```
