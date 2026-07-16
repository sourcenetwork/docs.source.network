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
