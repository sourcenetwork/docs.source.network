---
title: Aggregating functions
description: The aggregating functions `MIN`, `MAX`, `SUM`, `AVG`, and `COUNT` allow you to compute operations on groups of documents.
---

The aggregating functions `MIN`, `MAX`, `SUM`, `AVG`, and `COUNT` allow you to compute operations on groups of documents, such as the average rating of a group of books, or counting how many books are in each group. You can also use them at the root level and compute such operations on the whole result set.

<details>
  <summary>Display database setup</summary>
  
  To reproduce the example results from this page, your database needs the following setup.

  ```graphql title="Database schema" test-setup-collection
  type Book {
    title: String!
    genre: String
    plot: String
    rating: Float
    ratings: [Float]
    author: Person
    seller: Company
  }
  
  type Person {
    name: String!
    authoredBooks: [Book]
  }

  type Company {
    name: String!
    sells: [Book]
  }
  ```
  ```graphql title="Documents setup" test-setup-data
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

    c1:add_Company(input: {
      name: "The Independent Hipster Bookshop"
    }) { _docID name }
    c2:add_Company(input: {
      name: "The World-Destroying Large Chain"
    }) { _docID name }
  
    b11:add_Book(input: {
      title: "1984",
      genre: "Fiction",
      plot: "A masterpiece of rebellion and imprisonment where war is peace, freedom is slavery, and Big Brother is watching.",
      rating: 4.20,
      ratings: [3.8, 4.91, 3.1, 2.8],
      _authorID: "bae-bc532931-4843-50bc-bbdd-3e31549c8cc6",
      _sellerID: "bae-a5300933-fb0a-5b8f-b38e-202565993ff0"
    }) { _docID title }
    b12:add_Book(input: {
      title: "Down and Out in Paris and London",
      genre: "Memoir",
      plot: "The adventures of a penniless British writer among the down-and-outs of two great cities.",
      rating: 4.09,
      _authorID: "bae-bc532931-4843-50bc-bbdd-3e31549c8cc6",
      _sellerID: "bae-a5300933-fb0a-5b8f-b38e-202565993ff0"
    }) { _docID title }
    b21:add_Book(input: {
      title: "Lord of the Flies",
      genre: "Fiction",
      plot: "At the dawn of the next world war, a plane crashes on an uncharted island, stranding a group of schoolboys.",
      rating: 3.70,
      _authorID: "bae-6025af65-e57e-5db5-84dd-d349b130c6d9",
      _sellerID: "bae-a5300933-fb0a-5b8f-b38e-202565993ff0"
    }) { _docID title }
    b31:add_Book(input: {
      title: "Infinite Jest",
      genre: "Fiction",
      plot: "A gargantuan, mind-altering tragi-comedy about the Pursuit of Happiness in America.",
      rating: 4.25,
      ratings: [3.1, 4.1, 4.5],
      _authorID: "bae-26c791a7-fa81-5d86-95c5-4119e2fef915",
      _sellerID: "bae-81d5fadb-c2a3-5d95-b235-a220c220bf79"
    }) { _docID title }
    b32:add_Book(input: {
      title: "Consider the Lobster and Other Essays",
      genre: "Nonfiction",
      plot: "Do lobsters feel pain? Did Franz Kafka have a funny bone? What is John Updike's deal, anyway? And what happens when adult video starlets meet their fans in person? Essays that are also enthralling narrative adventures.",
      rating: 4.18,
      _authorID: "bae-26c791a7-fa81-5d86-95c5-4119e2fef915",
      _sellerID: "bae-81d5fadb-c2a3-5d95-b235-a220c220bf79"
    }) { _docID title }
    b33:add_Book(input: {
      title: "Girl with Curious Hair",
      genre: "Fiction",
      plot: "Remarkable and unsettling reimaginations of reality.",
      rating: 3.85,
      _authorID: "bae-26c791a7-fa81-5d86-95c5-4119e2fef915",
      _sellerID: "bae-81d5fadb-c2a3-5d95-b235-a220c220bf79"
    }) { _docID title }
    b41:add_Book(input: {
      title: "Les Misérables",
      genre: "Fiction",
      plot: "Victor Hugo's tale of injustice, heroism and love follows the fortunes of Jean Valjean, an escaped convict determined to put his criminal past behind him.",
      rating: 4.21,
      ratings: [3.9, 4.1],
      _authorID: "bae-4bfe5f4c-d668-5dc3-9de2-eb598af3da7d",
      _sellerID: "bae-81d5fadb-c2a3-5d95-b235-a220c220bf79"
    }) { _docID title }
  }
  ```
</details>

## Syntax {/* #syntax */}

<Tabs groupId="aggregating-funcs">
  <TabItem value="MIN" label="MIN" default>
    ```graphql title="Syntax &ndash; MIN" test-skip
    MIN(GROUP: { 
      field: String, 
      filter: Object,
      limit: Int, offset: Int
    })
    ```
    - `field` &ndash; Field on which to run the aggregating function.
    - `filter` &ndash; Restrict which documents are included, see [Filter documents](filter.md).
    - `limit, offset` &ndash; Restrict how many documents are included, see [Limit and paginate results](limit-paginate.md).
  </TabItem>
  <TabItem value="MAX" label="MAX" default>
    ```graphql title="Syntax &ndash; MAX" test-skip
    MAX(GROUP: { 
      field: String, 
      filter: Object,
      limit: Int, offset: Int
    })
    ```
    - `field` &ndash; Field on which to run the aggregating function.
    - `filter` &ndash; Restrict which documents are included, see [Filter documents](filter.md).
    - `limit, offset` &ndash; Restrict how many documents are included, see [Limit and paginate results](limit-paginate.md).
  </TabItem>
  <TabItem value="SUM" label="SUM" default>
    ```graphql title="Syntax &ndash; SUM" test-skip
    SUM(GROUP: { 
      field: String, 
      filter: Object,
      limit: Int, offset: Int
    })
    ```
    - `field` &ndash; Field on which to run the aggregating function.
    - `filter` &ndash; Restrict which documents are included, see [Filter documents](filter.md).
    - `limit, offset` &ndash; Restrict how many documents are included, see [Limit and paginate results](limit-paginate.md).
  </TabItem>
  <TabItem value="AVG" label="AVG" default>
    ```graphql title="Syntax &ndash; AVG" test-skip
    AVG(GROUP: { 
      field: String, 
      filter: Object,
      limit: Int, offset: Int
    })
    ```
    - `field` &ndash; Field on which to run the aggregating function.
    - `filter` &ndash; Restrict which documents are included, see [Filter documents](filter.md).
    - `limit, offset` &ndash; Restrict how many documents are included, see [Limit and paginate results](limit-paginate.md).
  </TabItem>
  <TabItem value="COUNT" label="COUNT" default>
    ```graphql title="Syntax &ndash; COUNT" test-skip
    COUNT(GROUP: { 
      filter: Object,
      limit: Int, offset: Int
    })
    ```
    - `filter` &ndash; Restrict which documents are included, see [Filter documents](filter.md).
    - `limit, offset` &ndash; Restrict how many documents are included, see [Limit and paginate results](limit-paginate.md).
  </TabItem>
</Tabs>

## Usage with groups {/* #groups */}

When [grouping results](group.md), aggregating functions take as input the documents belonging to each group and produce a result for each group. It is optional to include the `GROUP` sub-object in the return fields.

```graphql title="Compute average rating for each book genre"
{
  Book(groupBy: [genre]) {
    genre
    AVG(GROUP: { field: rating })
    GROUP {  # optional
      title
      rating
    }
  }
}
```
```json title="Result"
{
  "data": {
    "Book": [
      {
        // highlight-next-line
        "AVG": 4.042,
        "GROUP": [
          {
            "rating": 4.2,
            "title": "1984"
          },
          {
            "rating": 3.7,
            "title": "Lord of the Flies"
          },
          {
            "rating": 4.25,
            "title": "Infinite Jest"
          },
          {
            "rating": 3.85,
            "title": "Girl with Curious Hair"
          },
          {
            "rating": 4.21,
            "title": "Les Misérables"
          }
        ],
        "genre": "Fiction"
      },
      {
        // highlight-next-line
        "AVG": 4.09,
        "GROUP": [
          {
            "rating": 4.09,
            "title": "Down and Out in Paris and London"
          }
        ],
        "genre": "Memoir"
      },
      {
        // highlight-next-line
        "AVG": 4.18,
        "GROUP": [
          {
            "rating": 4.18,
            "title": "Consider the Lobster and Other Essays"
          }
        ],
        "genre": "Nonfiction"
      }
    ]
  }
}
```

```graphql title="Count how many documents are in each genre"
{
  Book(groupBy: [genre]) {
    genre
    COUNT(GROUP: {})
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
        // highlight-next-line
        "COUNT": 5,
        "GROUP": [
          {
            "title": "1984"
          },
          {
            "title": "Lord of the Flies"
          },
          {
            "title": "Infinite Jest"
          },
          {
            "title": "Girl with Curious Hair"
          },
          {
            "title": "Les Misérables"
          }
        ],
        "genre": "Fiction"
      },
      {
        // highlight-next-line
        "COUNT": 1,
        "GROUP": [
          {
            "title": "Down and Out in Paris and London"
          }
        ],
        "genre": "Memoir"
      },
      {
        // highlight-next-line
        "COUNT": 1,
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

### Filter documents {/* #filter-documents */}

The `filter` object in the aggregating function only affects which documents are used to compute the function; it does not control which documents the query returns. To affect which documents are returned, place the filter at the root or group level. 

Note how the following example result differs from the previous one only in the `AVG` value for `Fiction`; the documents returned for the group still include ratings lower than 4.

```graphql title="Compute average rating for each book genre, excluding ratings lower than 4"
{
  Book(groupBy: [genre]) {
    genre
    AVG(GROUP: { field: rating, filter: { rating: { _geq: 4 } } })
    GROUP {
      title
      rating
    }
  }
}
```
```json title="Result"
{
  "data": {
    "Book": [
      {
        // highlight-next-line
        "AVG": 4.22,
        "GROUP": [
          {
            "rating": 4.2,
            "title": "1984"
          },
          {
            "rating": 3.7,
            "title": "Lord of the Flies"
          },
          {
            "rating": 4.25,
            "title": "Infinite Jest"
          },
          {
            "rating": 3.85,
            "title": "Girl with Curious Hair"
          },
          {
            "rating": 4.21,
            "title": "Les Misérables"
          }
        ],
        "genre": "Fiction"
      },
      {
        // highlight-next-line
        "AVG": 4.09,
        "GROUP": [
          {
            "rating": 4.09,
            "title": "Down and Out in Paris and London"
          }
        ],
        "genre": "Memoir"
      },
      {
        // highlight-next-line
        "AVG": 4.18,
        "GROUP": [
          {
            "rating": 4.18,
            "title": "Consider the Lobster and Other Essays"
          }
        ],
        "genre": "Nonfiction"
      }
    ]
  }
}
```

### Multiple fields {/* #multiple-fields */}

When [grouping on multiple fields](group.md#multiple-fields), you can run an aggregating function _inside_ a `GROUP` sub-object, and use its output as input to another, higher-level aggregating function:

```graphql title="Compute the maximum of group averages"
{
  Book(groupBy: [genre]) {
    genre
    author { name }
    # highlight-next-line
    MAX(GROUP: { field: AVG })
    GROUP (groupBy: [author]) {
      author { name }
      # highlight-next-line
      AVG(GROUP: { field: rating })
      GROUP {
        title
        rating
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
            "AVG": 4.2,
            "GROUP": [
              {
                "rating": 4.2,
                "title": "1984"
              }
            ],
            "author": {
              "name": "George Orwell"
            }
          },
          {
            "AVG": 3.7,
            "GROUP": [
              {
                "rating": 3.7,
                "title": "Lord of the Flies"
              }
            ],
            "author": {
              "name": "William Golding"
            }
          },
          {
            "AVG": 4.05,
            "GROUP": [
              {
                "rating": 4.25,
                "title": "Infinite Jest"
              },
              {
                "rating": 3.85,
                "title": "Girl with Curious Hair"
              }
            ],
            "author": {
              "name": "David Foster Wallace"
            }
          },
          {
            "AVG": 4.21,
            "GROUP": [
              {
                "rating": 4.21,
                "title": "Les Misérables"
              }
            ],
            "author": {
              "name": "Victor Hugo"
            }
          }
        ],
        // highlight-next-line
        "MAX": 4.21,
        "author": {
          "name": "Victor Hugo"
        },
        "genre": "Fiction"
      },
      {
        "GROUP": [
          {
            "AVG": 4.09,
            "GROUP": [
              {
                "rating": 4.09,
                "title": "Down and Out in Paris and London"
              }
            ],
            "author": {
              "name": "George Orwell"
            }
          }
        ],
        // highlight-next-line
        "MAX": 4.09,
        "author": {
          "name": "George Orwell"
        },
        "genre": "Memoir"
      },
      {
        "GROUP": [
          {
            "AVG": 4.18,
            "GROUP": [
              {
                "rating": 4.18,
                "title": "Consider the Lobster and Other Essays"
              }
            ],
            "author": {
              "name": "David Foster Wallace"
            }
          }
        ],
        // highlight-next-line
        "MAX": 4.18,
        "author": {
          "name": "David Foster Wallace"
        },
        "genre": "Nonfiction"
      }
    ]
  }
}
```

## Usage at root level {/* #root-level */}

You can provide the whole result set to an aggregating functions, and have its result as the only return field.

```graphql title="Compute average rating of all books rated above 1"
{
  AVG(Book: {
    field: rating,
    filter: { rating: { _geq: 1 } }
  })
}
```
```json title="Result"
{
  "data": {
    "AVG": 4.0685714285714285
  }
}
```

```graphql title="Count how many books are rated 4 or higher"
{
  COUNT(Book: {
    filter: { rating: { _geq: 4 } }
  })
}
```
```json title="Result"
{
  "data": {
    "COUNT": 5
  }
}
```
