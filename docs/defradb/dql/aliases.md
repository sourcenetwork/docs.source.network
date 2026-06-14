---
title: Rename result fields (aliases)
---

Sometimes, _Little Bobby Tables_ is the right name. Other times, you might want to change the default names that the database returns in results. Aliases allow you to rename fields and entire query results with identifiers of your choice.

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

## Rename queries

To rename the return key for a query, prefix the custom name to the query and separate the two with a colon `:`.

```graphql title='Return the three top-rated books under the key "topThreeBooks"'
{
  # highlight-next-line
  topThreeBooks: Book(order: { rating: DESC }, limit: 3) {
    title
    plot
    rating
  }
}
```
```json title="Result"
{
  "data": {
    // highlight-next-line
    "topThreeBooks": [
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

You must alias queries when one request contains multiple queries to the same type.

```graphql title='Two queries on type Book return results under "topThreeBooks" and "worstThreeBooks"'
{
  # highlight-next-line
  topThreeBooks: Book(order: { rating: DESC }, limit: 3) {
    title
    genre
    plot
  }
  # highlight-next-line
  worstThreeBooks: Book(order: { rating: ASC }, limit: 3) {
    title
    genre
    plot
  }
}
```
```json title="Result"
{
  "data": {
    // highlight-next-line
    "topThreeBooks": [
      {
        "genre": "Fiction",
        "plot": "A gargantuan, mind-altering tragi-comedy about the Pursuit of Happiness in America.",
        "title": "Infinite Jest"
      },
      {
        "genre": "Fiction",
        "plot": "Victor Hugo's tale of injustice, heroism and love follows the fortunes of Jean Valjean, an escaped convict determined to put his criminal past behind him.",
        "title": "Les Misérables"
      },
      {
        "genre": "Fiction",
        "plot": "A masterpiece of rebellion and imprisonment where war is peace, freedom is slavery, and Big Brother is watching.",
        "title": "1984"
      }
    ],
    // highlight-next-line
    "worstThreeBooks": [
      {
        "genre": "Fiction",
        "plot": "At the dawn of the next world war, a plane crashes on an uncharted island, stranding a group of schoolboys.",
        "title": "Lord of the Flies"
      },
      {
        "genre": "Biography",
        "plot": "The adventures of a penniless British writer among the down-and-outs of two great cities.",
        "title": "Down and Out in Paris and London"
      },
      {
        "genre": "Nonfiction",
        "plot": "Do lobsters feel pain? Did Franz Kafka have a funny bone? What is John Updike's deal, anyway? And what happens when adult video starlets meet their fans in person? Essays that are also enthralling narrative adventures.",
        "title": "Consider the Lobster and Other Essays"
      }
    ]
  }
}
```

## Rename fields

To rename the return key for a field, prefix the custom name to the field in the selection set and separate the two with a colon `:`.

```graphql title='Rename the field "plot" to "description"'
{
  Book(limit: 1) {
    title
    genre
    # highlight-next-line
    description: plot
  }
}
```
```json title="Result"
{
  "data": {
    "Book": [
      {
        "description": "At the dawn of the next world war, a plane crashes on an uncharted island, stranding a group of schoolboys.",
        "genre": "Fiction",
        "title": "Lord of the Flies"
      }
    ]
  }
}
```

:::tip
Filters over renamed fields require the `_alias` key. See [Filter -> Field aliases](filter.md#field-aliases) for more information.
:::
