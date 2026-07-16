---
title: Collapse Code Blocks
---

Code blocks can collapse to a fixed height with an "Expand (N lines)" button.
Behavior is controlled per fence with three flags:

| Flag | Effect |
|---|---|
| *(none)* | Heuristic: collapse when the block has ≥ 12 lines **and** its title is `Result` |
| `collapse` | Force the collapse UI on, regardless of length or title |
| `noCollapse` | Force it off |
| `expanded` | Start expanded (combine with `collapse`, or with a block the heuristic catches) |
| `valid` | Frame the block with a green border (correct example) |
| `invalid` | Frame the block with a red border (incorrect example) |

## Heuristic: short "Result" block stays open

Under 12 lines, so no collapse even with the `Result` title.

````md
```json title="Result"
````

```graphql title='Return books with title "1984" and genre "Fiction"'
{
  Book(
    filter: {
      # filters combined with AND by default
      # highlight-next-line
      title: { _eq: "1984" }
      # highlight-next-line
      genre: { _eq: "Fiction" }
    }
  ) {
    title
    genre
    plot
  }
}
```

```json title="Result"
{
  "data": {
    "Book": [
      {
        "genre": "Fiction",
        "plot": "A masterpiece of rebellion and imprisonment where war is peace, freedom is slavery, and Big Brother is watching.",
        "title": "1984"
      }
    ]
  }
}
```

## Heuristic: long "Result" block auto-collapses

Same fence syntax as above — the collapse kicks in purely because the block is ≥ 12 lines.

````md
```json title="Result"
````

```json title="Result"
{
  "data": {
    "Book": [
      {
        "genre": "Fiction",
        "plot": "A masterpiece of rebellion and imprisonment where war is peace, freedom is slavery, and Big Brother is watching.",
        "title": "1984"
      },
      {
        "genre": "Fiction",
        "plot": "At the dawn of the next world war, a plane crashes on an uncharted island, stranding a group of schoolboys.",
        "title": "Lord of the Flies"
      }
    ]
  }
}
```

## Heuristic: long block without "Result" title stays open

````md
```json title="Books"
````

```json title="Books"
{
  "data": {
    "Book": [
      {
        "genre": "Fiction",
        "plot": "A masterpiece of rebellion and imprisonment where war is peace, freedom is slavery, and Big Brother is watching.",
        "title": "1984"
      },
      {
        "genre": "Fiction",
        "plot": "At the dawn of the next world war, a plane crashes on an uncharted island, stranding a group of schoolboys.",
        "title": "Lord of the Flies"
      }
    ]
  }
}
```

## Heuristic: long block with no title stays open

No flags, no title — the default for plain code blocks, however long. This one
is more than double the 12-line threshold and still renders in full.

````md
```json
````

```json
{
  "data": {
    "Book": [
      {
        "genre": "Fiction",
        "plot": "A masterpiece of rebellion and imprisonment where war is peace, freedom is slavery, and Big Brother is watching.",
        "title": "1984"
      },
      {
        "genre": "Fiction",
        "plot": "At the dawn of the next world war, a plane crashes on an uncharted island, stranding a group of schoolboys.",
        "title": "Lord of the Flies"
      },
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
        "genre": "Memoir",
        "plot": "The adventures of a penniless British writer among the down-and-outs of two great cities.",
        "title": "Down and Out in Paris and London"
      }
    ]
  }
}
```

## `collapse`: force collapse where the heuristic would not

````md
```json title="Books" collapse
````

```json title="Books" collapse
{
  "data": {
    "Book": [
      {
        "genre": "Fiction",
        "plot": "A gargantuan, mind-altering tragi-comedy about the Pursuit of Happiness in America.",
        "title": "Infinite Jest"
      }
    ]
  }
}
```

## `collapse expanded`: collapsible, but starts open

````md
```json title="Result" collapse expanded
````

```json title="Result" collapse expanded
{
  "data": {
    "Book": [
      {
        "genre": "Fiction",
        "plot": "A masterpiece of rebellion and imprisonment where war is peace, freedom is slavery, and Big Brother is watching.",
        "title": "1984"
      },
      {
        "genre": "Fiction",
        "plot": "At the dawn of the next world war, a plane crashes on an uncharted island, stranding a group of schoolboys.",
        "title": "Lord of the Flies"
      }
    ]
  }
}
```

## `noCollapse`: opt a long "Result" block out

````md
```json title="Result" noCollapse
````

```json title="Result" noCollapse
{
  "data": {
    "Book": [
      {
        "genre": "Fiction",
        "plot": "A masterpiece of rebellion and imprisonment where war is peace, freedom is slavery, and Big Brother is watching.",
        "title": "1984"
      },
      {
        "genre": "Fiction",
        "plot": "At the dawn of the next world war, a plane crashes on an uncharted island, stranding a group of schoolboys.",
        "title": "Lord of the Flies"
      }
    ]
  }
}
```

## `valid` / `invalid`: frame correct and incorrect examples

Independent of the collapse flags — they wrap the block (title bar included)
in a green or red border.

````md
```graphql title="Valid — explicit operator" valid
````

```graphql title="Valid — explicit operator" valid
filter: {
  _and: [
    { rating: { _gte: 4 } },
    { rating: { _lte: 5 } }
  ]
}
```

````md
```graphql title="Invalid — duplicate fields" invalid
````

```graphql title="Invalid — duplicate fields" invalid
filter: {
  rating: { _gte: 4 },
  rating: { _lte: 5 }
}
```

The flags compose with the collapse ones, e.g. an incorrect long result:

````md
```json title="Result" invalid collapse
````

```json title="Result" invalid collapse
{
  "errors": [
    {
      "message": "Duplicate field \"rating\" in filter object",
      "locations": [{ "line": 3, "column": 5 }]
    }
  ]
}
```
