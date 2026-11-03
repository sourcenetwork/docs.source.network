---
title: Vector embeddings
description: With the @embedding directive you can entirely delegate the generation of embeddings to the database. Vectors allow you to query for documents basing on their similarity to other documents or to specific vector embeddings.
---

Vector embeddings represent data (ex. text) as lists of numbers (vectors). Vectors allow you to query for documents basing on their similarity to other documents or to specific vector embeddings (see [Vector indexes](schema/indexes.md#vector-indexes) and [Query similar documents](dql/similarity.md)).

You can create an embedding field with the `@embedding` directive on a collection field of type `[Float32!]`. Fields marked with `@embedding` become a vector *mirror* of the document's fields: when a document is added or updated, the corresponding vector embedding is regenerated to match the new content.

:::tip
The `@embedding` directive is useful to entirely delegate the generation of embeddings to the database. If you plan to manually generate vector embeddings, use a field of type `[Float32!]` and don't mark it with the `@embedding` directive &ndash; you'll still be able to create vector indexes on it and run similarity queries.
:::

## Syntax {/* #syntax */}

```graphql title="Syntax &ndash; @embedding directive"
@embedding(
  fields: [String]!,
  provider: String!,
  model: String!,
  url: String
)
```
- `fields` &ndash; Collection fields to create embeddings of.  
Supported field types are: `Float32`, `Float64`, `Int`, `String`.
- `provider` &ndash; Embedding provider.  
Supported values: `ollama`, `openai`.
- `model` &ndash; Embedding model (ex. `embeddinggemma`, `text-embedding-3-small`).
- `url` &ndash; (Optional) URL of provider's API.  
Default: `https://api.openai.com/v1` for `openai`; `http://localhost:11434/api` for `ollama`.

:::note
If `fields` contains several entries, embeddings will be generated even if a document lacks value for some of the fields.
:::

## Providers

### Ollama

Use the `ollama` provider to generate [embeddings with Ollama](https://docs.ollama.com/capabilities/embeddings). The `url` field is only needed if you use Ollama models hosted elsewhere than the default `http://localhost:11434/api`.

```graphql title="Embedding field with Ollama provider" test-setup-collection
type Book {
  title: String
  plot: String
  about_v: [Float32!] @embedding(
    fields: ["title", "plot"],
    provider: "ollama",
    model: "embeddinggemma"
  )
}
```

:::tip
The selected embedding model must be available in the Ollama instance ahead of usage.  
For example, to install `embeddinggemma`:

```
ollama pull embeddinggemma
```
:::

### OpenAI

Use the `openai` provider to generate [embeddings using OpenAI](https://developers.openai.com/api/docs/guides/embeddings). The `url` field is only needed if you use OpenAI models hosted elsewhere than the default `https://api.openai.com/v1`.

Provide your OpenAI API key via the environment variable `OPENAI_API_KEY`. The variable must be defined in the environment in which `defradb` runs.

```graphql title="Embedding field with OpenAI provider" test-setup-collection
type Book {
  title: String
  plot: String
  about_v: [Float32!] @embedding(
    fields: ["title", "plot"],
    provider: "openai",
    model: "text-embedding-3-small"
  )
}
```

## Storing embedding vectors

An embedding field is a vector mirror of the fields it encodes:
- when a new document is created, the embedding field gets populated with a vector encoding the content fields
- when a document is updated, the embedding field is regenerated to account for changes in the content fields

The embedding is generated even if a document lacks value for one or more of the embedding fields. 

```graphql title='Creating a new "Book" results in the embedding field "about_v" to be populated'" test-result-skip
mutation {
  add_Book(input: {
    title: "Infinite Jest"
  }) { 
    title
    plot
    about_v
  }
}
```
```json result title="Result output capped"
{
  "data": {
    "add_Book": [
      {
        "about_v": [
          -0.14905636,
          -0.012006985,
          0.030906163,
          ...
          (768 entries)
        ],
        "plot": "",
        "title": "Infinite Jest"
      }
    ]
  }
}   
```

### Explicit values

You can also set an embedding value to an explicit vector value. However, the vector value will be overwritten if the document is updated, as the database will sync the source content fields with the embedding value.

```graphql title="Set an explicit vector value"
mutation {
  update_Book(
    filter: { title: { _eq: "Infinite Jest" } },
    input: { about_v: [1,2,3] }
  ) {
    title
    about_v
  }
}
```