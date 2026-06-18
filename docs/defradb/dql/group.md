---
title: Group results
---

The `groupBy` argument allows you to group results into buckets basing on the value of one or more fields. For example, books of different genre can be grouped together, and separated from books of other genres. 

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
    ratings: [Float]
  }
  ```
  ```graphql title="Person documents setup" test-setup-data
  mutation {
    a1:add_Person(input: {
      name: "George Orwell"
    }) { _docID name }
    a2:add_Person(input: {
      name: "William Golding"
    }) { _docID name }
    a3:add_Person(input: {
      name: "David Foster Wallace"
    }) { _docID name }
    a4:add_Person(input: {
      name: "Victor Hugo"
    }) { _docID name }
  }
  ```
  ```graphql title="Book documents setup" test-setup-data
  mutation {
    b11:add_Book(input: {
      title: "1984",
      genre: "Fiction",
      plot: "A masterpiece of rebellion and imprisonment where war is peace, freedom is slavery, and Big Brother is watching.",
      rating: 4.20,
      ratings: [3.8, 4.91, 3.1, 2.8],
      _authorID: "bae-f630242e-3faf-525e-864c-422e09b00667"
    }) {
      _docID
      title
    }
    b12:add_Book(input: {
      title: "Down and Out in Paris and London",
      genre: "Memoir",
      plot: "The adventures of a penniless British writer among the down-and-outs of two great cities.",
      rating: 4.09,
      _authorID: "bae-f630242e-3faf-525e-864c-422e09b00667"
    }) {
      _docID
      title
    }
    b21:add_Book(input: {
      title: "Lord of the Flies",
      genre: "Fiction",
      plot: "At the dawn of the next world war, a plane crashes on an uncharted island, stranding a group of schoolboys.",
      rating: 3.70,
      _authorID: "bae-db573e8d-2466-55b9-8da0-39003f530d44"
    }) {
      _docID
      title
    }
    b31:add_Book(input: {
      title: "Infinite Jest",
      genre: "Fiction",
      plot: "A gargantuan, mind-altering tragi-comedy about the Pursuit of Happiness in America.",
      rating: 4.25,
      ratings: [3.1, 4.1, 4.5],
      _authorID: "bae-40b16347-07e0-5e97-85e0-8742eaba786e"
    }) {
      _docID
      title
    }
    b32:add_Book(input: {
      title: "Consider the Lobster and Other Essays",
      genre: "Nonfiction",
      plot: "Do lobsters feel pain? Did Franz Kafka have a funny bone? What is John Updike's deal, anyway? And what happens when adult video starlets meet their fans in person? Essays that are also enthralling narrative adventures.",
      rating: 4.18,
      _authorID: "bae-40b16347-07e0-5e97-85e0-8742eaba786e"
    }) {
      _docID
      title
    }
    b33:add_Book(input: {
      title: "Girl with Curious Hair",
      genre: "Fiction",
      plot: "Remarkable and unsettling reimaginations of reality.",
      rating: 3.85,
      _authorID: "bae-40b16347-07e0-5e97-85e0-8742eaba786e"
    }) {
      _docID
      title
    }
    b41:add_Book(input: {
      title: "Les Misérables",
      genre: "Fiction",
      plot: "Victor Hugo's tale of injustice, heroism and love follows the fortunes of Jean Valjean, an escaped convict determined to put his criminal past behind him.",
      rating: 4.21,
      ratings: [3.9, 4.1],
      _authorID: "bae-7f9e6642-03e3-5f62-b684-3d5555f46f7d"
    }) {
      _docID
      title
    }
  }
  ```
</details>

## Syntax {/* #syntax */}

Queries with `groupBy` have an optional `GROUP` sub-object among its return fields. It supports all arguments of [query blocks](mutation-query.md#syntax) and its return set gives access to all of the document's fields.

```graphql title="Syntax" test-skip
TYPE(groupBy: [field]) {
  field
  GROUP(filter: object, docID: [ID], order: [object], limit: int, offset: int, orderBy: [object], groupBy: [field]) {
    field
  }
}
```

## Group by a single field {/* #single */}

```graphql title="Group books by genre"
{
  Book(groupBy: [genre]) {
    genre
    GROUP {
      title
      plot
      author {
        name
      }
    }
  }
}
```
```json title="Result"
{
  "data": {
    "Book": [
      {
        "GROUP": [
          {
            "author": {
              "name": "Victor Hugo"
            },
            "plot": "Victor Hugo's tale of injustice, heroism and love follows the fortunes of Jean Valjean, an escaped convict determined to put his criminal past behind him.",
            "title": "Les Misérables"
          },
          {
            "author": {
              "name": "David Foster Wallace"
            },
            "plot": "A gargantuan, mind-altering tragi-comedy about the Pursuit of Happiness in America.",
            "title": "Infinite Jest"
          },
          {
            "author": {
              "name": "George Orwell"
            },
            "plot": "A masterpiece of rebellion and imprisonment where war is peace, freedom is slavery, and Big Brother is watching.",
            "title": "1984"
          },
          {
            "author": {
              "name": "William Golding"
            },
            "plot": "At the dawn of the next world war, a plane crashes on an uncharted island, stranding a group of schoolboys.",
            "title": "Lord of the Flies"
          },
          {
            "author": {
              "name": "David Foster Wallace"
            },
            "plot": "Remarkable and unsettling reimaginations of reality.",
            "title": "Girl with Curious Hair"
          }
        ],
        "genre": "Fiction"
      },
      {
        "GROUP": [
          {
            "author": {
              "name": "David Foster Wallace"
            },
            "plot": "Do lobsters feel pain? Did Franz Kafka have a funny bone? What is John Updike's deal, anyway? And what happens when adult video starlets meet their fans in person? Essays that are also enthralling narrative adventures.",
            "title": "Consider the Lobster and Other Essays"
          }
        ],
        "genre": "Nonfiction"
      },
      {
        "GROUP": [
          {
            "author": {
              "name": "George Orwell"
            },
            "plot": "The adventures of a penniless British writer among the down-and-outs of two great cities.",
            "title": "Down and Out in Paris and London"
          }
        ],
        "genre": "Memoir"
      }
    ]
  }
}
```

- `groupBy` &ndash; Takes a list of field names.
- `GROUP` &ndash; The aggregate sub-object contains all fields of the root object (`Book`), including relationships. The sub-object can be tweaked to further refine its output with (see [Combine root and `GROUP` query arguments](#root-group-query-args)).

:::important Allowed return fields
The return object can only include the grouped-by fields, the `GROUP` sub-object, and the result of other [aggregating functions](aggregating-functions.md). For example, in a query with `groupBy: [genre, rating]`, `genre` and `rating` are the only fields that can be directly returned. Other fields can be accessed from the `GROUP` sub-object.
:::

## Group by relationship {/* #relationships */}

You can group results by a relationship fields as well. You can only group by the whole object; grouping by object sub-fields (i.e. `groupBy: author.name` ) is not supported.

```graphql title="Group books by author"
{
  Book(groupBy: [author], order: { author: { name: ASC } }) {
    author {
      name
    }
    GROUP {
      title
      plot
    }
  }
}
```
```json title="Result"
{
  "data": {
    "Book": [
      {
        "GROUP": [
          {
            "plot": "A gargantuan, mind-altering tragi-comedy about the Pursuit of Happiness in America.",
            "title": "Infinite Jest"
          },
          {
            "plot": "Do lobsters feel pain? Did Franz Kafka have a funny bone? What is John Updike's deal, anyway? And what happens when adult video starlets meet their fans in person? Essays that are also enthralling narrative adventures.",
            "title": "Consider the Lobster and Other Essays"
          },
          {
            "plot": "Remarkable and unsettling reimaginations of reality.",
            "title": "Girl with Curious Hair"
          }
        ],
        "author": {
          "name": "David Foster Wallace"
        }
      },
      {
        "GROUP": [
          {
            "plot": "The adventures of a penniless British writer among the down-and-outs of two great cities.",
            "title": "Down and Out in Paris and London"
          },
          {
            "plot": "A masterpiece of rebellion and imprisonment where war is peace, freedom is slavery, and Big Brother is watching.",
            "title": "1984"
          }
        ],
        "author": {
          "name": "George Orwell"
        }
      },
      {
        "GROUP": [
          {
            "plot": "Victor Hugo's tale of injustice, heroism and love follows the fortunes of Jean Valjean, an escaped convict determined to put his criminal past behind him.",
            "title": "Les Misérables"
          }
        ],
        "author": {
          "name": "Victor Hugo"
        }
      },
      {
        "GROUP": [
          {
            "plot": "At the dawn of the next world war, a plane crashes on an uncharted island, stranding a group of schoolboys.",
            "title": "Lord of the Flies"
          }
        ],
        "author": {
          "name": "William Golding"
        }
      }
    ]
  }
}
```

## Group by multiple fields {/* #multiple-fields */}

You can create groups basing on the value of multiple fields by providing a list to `groupBy`. The groups are not nested: each combination of `groupBy` fields values results in a separate group.

```graphql title="Group books by genre and author"
{
  Book(groupBy: [genre, author]) {
    genre
    author { name }
    GROUP { title }
  }
}
```
```json title="Result"
{
  "data": {
    "Book": [
      {
        "GROUP": [
          {
            "title": "Les Misérables"
          }
        ],
        "author": {
          "name": "Victor Hugo"
        },
        "genre": "Fiction"
      },
      {
        "GROUP": [
          {
            "title": "Infinite Jest"
          },
          {
            "title": "Girl with Curious Hair"
          }
        ],
        "author": {
          "name": "David Foster Wallace"
        },
        "genre": "Fiction"
      },
      {
        "GROUP": [
          {
            "title": "Consider the Lobster and Other Essays"
          }
        ],
        "author": {
          "name": "David Foster Wallace"
        },
        "genre": "Nonfiction"
      },
      {
        "GROUP": [
          {
            "title": "Down and Out in Paris and London"
          }
        ],
        "author": {
          "name": "George Orwell"
        },
        "genre": "Memoir"
      },
      {
        "GROUP": [
          {
            "title": "1984"
          }
        ],
        "author": {
          "name": "George Orwell"
        },
        "genre": "Fiction"
      },
      {
        "GROUP": [
          {
            "title": "Lord of the Flies"
          }
        ],
        "author": {
          "name": "William Golding"
        },
        "genre": "Fiction"
      }
    ]
  }
}
```

## Combine root and `GROUP` query arguments {/* #root-group-query-args */}

You can specify filters and other [query arguments](mutation-query.md#syntax) both at the root level and in the `GROUP` aggregate. For example, you can query for books rated at least `4.2`, group and sort them by genre, limit the group size to `3` and sort results within each group by book title:

```graphql title="Grouping with query arguments at root and group level"
{
  Book(groupBy: [genre], order: { genre: ASC }, filter: { rating: { _geq: 4.2 }}) {
    genre
    GROUP(limit: 3, order: { title: ASC }) {
      title
    }
  }
}
```
```json title="Result"
{
  "data": {
    "Book": [
      {
        "GROUP": [
          {
            "title": "1984"
          },
          {
            "title": "Infinite Jest"
          },
          {
            "title": "Les Misérables"
          }
        ],
        "genre": "Fiction"
      }
    ]
  }
}
```

The interplay between root and `GROUP` arguments can be subtle. When grouping results, the root object returns _groups_, and individual results are moved into the `GROUP` aggregate. For example, a `limit` argument at the root level affects the number of _groups_ returned, not how many results get fed into the grouping:

<div style={{float:'left', width: '49%'}}>
```graphql title="Limit query to one group of unlimited size"
{
  # highlight-next-line
  Book(groupBy: [genre, author], order: { genre: ASC }, limit: 1) {
    genre
    GROUP {
      title
    }
  }
}
```
```json title="Result"
{
  "data": {
    "Book": [
      {
        "GROUP": [
          {
            "title": "Les Misérables"
          },
          {
            "title": "Infinite Jest"
          },
          {
            "title": "1984"
          },
          {
            "title": "Lord of the Flies"
          },
          {
            "title": "Girl with Curious Hair"
          }
        ],
        "genre": "Fiction"
      }
    ]
  }
}
```
</div>
<div style={{float:'right', width: '49%'}}>
```graphql title="Limit groups size to one result only"
{
  Book(groupBy: [genre, author]) {
    genre
    # highlight-next-line
    GROUP(limit: 1) {
      title
    }
  }
}
```
```json title="Result"
{
  "data": {
    "Book": [
      {
        "GROUP": [
          {
            "title": "Les Misérables"
          }
        ],
        "genre": "Fiction"
      },
      {
        "GROUP": [
          {
            "title": "Consider the Lobster and Other Essays"
          }
        ],
        "genre": "Nonfiction"
      },
      {
        "GROUP": [
          {
            "title": "Down and Out in Paris and London"
          }
        ],
        "genre": "Memoir"
      }
    ]
  }
}
```
</div>
<div style={{clear:'both'}}></div>

Filters at the `GROUP` level allow you to restrict the groups to get only some subset of results. However, combining filters at root and `GROUP` level can also be tricky business. If a root-level filter yields no records, there's no groups to be formed and the result set is empty. However, if a root-level filter yields enough records for a group to form, the group could still be present and empty if the `GROUP`-level filter further shrinks the result set.

<div style={{float:'left', width: '49%'}}>
```graphql title="Grouping with query arguments at root and group level"
{
  Book(
    groupBy: [genre],
    # highlight-start
    filter: {
      rating: { _geq: 4 },
      plot: { _ilike: "%love%" }
    # highlight-end
    }
  ) {
    genre
    GROUP {
      title
      plot
    }
  }
}
```
```json title="Result"
{
  "data": {
    "Book": [
      {
        "GROUP": [
          {
            "plot": "Victor Hugo's tale of injustice, heroism and love follows the fortunes of Jean Valjean, an escaped convict determined to put his criminal past behind him.",
            "title": "Les Misérables"
          }
        ],
        "genre": "Fiction"
      }
    ]
  }
}
```
</div>
<div style={{float:'right', width: '49%'}}>
```graphql title="Grouping with query arguments at root and group level"
{
  Book(
    groupBy: [genre],
    # highlight-next-line
    filter: { rating: { _geq: 4 }}
  ) {
    genre
    GROUP(
      # highlight-next-line
      filter: { plot: { _ilike: "%love%" }}
    ) {
      title
      plot
    }
  }
}
```
```json title="Result"
{
  "data": {
    "Book": [
      {
        "GROUP": [
          {
            "plot": "Victor Hugo's tale of injustice, heroism and love follows the fortunes of Jean Valjean, an escaped convict determined to put his criminal past behind him.",
            "title": "Les Misérables"
          }
        ],
        "genre": "Fiction"
      },
      {
        "GROUP": [],
        "genre": "Nonfiction"
      },
      {
        "GROUP": [],
        "genre": "Memoir"
      }
    ]
  }
}
```
</div>
<div style={{clear:'both'}}></div>
