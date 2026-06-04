---
title: Group results
---

The `groupBy` argument allows you to group results into buckets basing on the value of one or more fields. For example, books of different genre can be grouped together, and separated from books of other genres.

## Group by a single field

```graphql title="Group books by genre"
{
  Book(groupBy: [genre]) {
    genre
    GROUP {
      title
      plot
      Author {
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
              "name": "William Golding"
            },
            "plot": "At the dawn of the next world war, a plane crashes on an uncharted island, stranding a group of schoolboys.",
            "title": "Lord of the Flies"
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
              "name": "George Orwell"
            },
            "plot": "A masterpiece of rebellion and imprisonment where war is peace, freedom is slavery, and Big Brother is watching.",
            "title": "1985"
          },
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
          }
        ],
        "genre": "Fiction"
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
        "genre": "Biography"
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
      }
    ]
  }
}
```

- `groupBy` &ndash; Takes a list of field names.
- `GROUP` &ndash; The aggregate sub-object contains all fields of the root object (`Book`), including relationships. The sub-object can be tweaked to further refine its output with (see [Combine root and `GROUP` query arguments](#root-group-query-args)).

:::important Allowed return fields
The return object can only include the grouped-by fields and the `GROUP` sub-object. For example, in a query with `groupBy: [genre, rating]`, `genre` and `rating` are the only fields that can be directly returned. Any other field can be accessed from the `GROUP` sub-object.
:::

## Group by relationship {/* #relationships */}

You can group results by a relationship fields as well. You can only group by the whole object; grouping by object sub-fields (i.e. `groupBy: author.name` ) is not supported.

```graphql title="Group books by author"
{
  Book(groupBy: [author]) {
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
            "plot": "At the dawn of the next world war, a plane crashes on an uncharted island, stranding a group of schoolboys.",
            "title": "Lord of the Flies"
          }
        ],
        "author": {
          "name": "William Golding"
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
          },
          {
            "plot": "A masterpiece of rebellion and imprisonment where war is peace, freedom is slavery, and Big Brother is watching.",
            "title": "1985"
          }
        ],
        "author": {
          "name": "George Orwell"
        }
      },
      {
        "GROUP": [
          {
            "plot": "Do lobsters feel pain? Did Franz Kafka have a funny bone? What is John Updike's deal, anyway? And what happens when adult video starlets meet their fans in person? Essays that are also enthralling narrative adventures.",
            "title": "Consider the Lobster and Other Essays"
          },
          {
            "plot": "A gargantuan, mind-altering tragi-comedy about the Pursuit of Happiness in America.",
            "title": "Infinite Jest"
          }
        ],
        "author": {
          "name": "David Foster Wallace"
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
      }
    ]
  }
}
```

## Group by multiple fields {/* #multiple-fields */}

You can create sub-groups within groups by providing multiple fields to `groupBy`. The first field creates groups; the second field sub-groups for each group; and so on.

```graphql title="Group books by genre first; then by author"
{
  Book(groupBy: [genre, author]) {
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
            "plot": "At the dawn of the next world war, a plane crashes on an uncharted island, stranding a group of schoolboys.",
            "title": "Lord of the Flies"
          }
        ],
        "author": {
          "name": "William Golding"
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
          },
          {
            "plot": "A masterpiece of rebellion and imprisonment where war is peace, freedom is slavery, and Big Brother is watching.",
            "title": "1985"
          }
        ],
        "author": {
          "name": "George Orwell"
        }
      },
      {
        "GROUP": [
          {
            "plot": "Do lobsters feel pain? Did Franz Kafka have a funny bone? What is John Updike's deal, anyway? And what happens when adult video starlets meet their fans in person? Essays that are also enthralling narrative adventures.",
            "title": "Consider the Lobster and Other Essays"
          },
          {
            "plot": "A gargantuan, mind-altering tragi-comedy about the Pursuit of Happiness in America.",
            "title": "Infinite Jest"
          }
        ],
        "author": {
          "name": "David Foster Wallace"
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
      }
    ]
  }
}
```

## Combine root and `GROUP` query arguments {/* #root-group-query-args */}

You can specify filters and other query arguments both at the root level and in the `GROUP` aggregate. For example, you can query for books rated at least `4.2`, group and sort them by genre, limit the group size to `3` and sort results within each group by book title:

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
  Book(groupBy: [genre, author], limit: 1) {
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
            "title": "Lord of the Flies"
          },
          {
            "title": "1984"
          },
          {
            "title": "Les Misérables"
          },
          {
            "title": "Infinite Jest"
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
            "title": "Lord of the Flies"
          }
        ],
        "genre": "Fiction"
      },
      {
        "GROUP": [
          {
            "title": "Down and Out in Paris and London"
          }
        ],
        "genre": "Biography"
      },
      {
        "GROUP": [
          {
            "title": "Consider the Lobster and Other Essays"
          }
        ],
        "genre": "Nonfiction"
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
    "Book": []
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
        "GROUP": [],
        "genre": "Biography"
      },
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
      }
    ]
  }
}
```
</div>
<div style={{clear:'both'}}></div>
