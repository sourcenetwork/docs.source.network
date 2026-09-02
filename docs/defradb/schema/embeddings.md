---
title: Vector embeddings
description: .
---

Vector embeddings represent data as lists of numbers, which allow for similarity queries to work.

Create an embedding field with the `embedding` directive

## Syntax {/* #syntax */}

```graphql title="Syntax &ndash; @embedding directive"
@embedding(
  fields: [String]!,
  provider: String!,
  model: String!,
  template: String,
  url: String
)
```
- `fields` &ndash; Collection fields to create embeddings of.
- `provider` &ndash; Embedding provider (either `ollama` or `openai`).
- `model` &ndash; Model to use to generate embeddings (ex. `embeddinggemma`, `text-embedding-3-small`).
- `template` &ndash; (Optional) Template for combining fields. The resulting string is the input to the embedding model.
- `url` &ndash; (Optional) URL of the provider's API.  
Default: `https://api.openai.com/v1` for `openai`; `http://localhost:11434/api` for `ollama`.

:::note
If multiple fields are provided, documents missing some will still get an embedding
:::

fields used for embedding generation
// are of supported type.
//
// Currently, the supported types are Float32, Float64, Int and String

## OpenAI

```graphql title="Embedding field with OpenAI model" test-setup-collection
type Book {
  title: String
  plot: String
  about_v: [Float32!] @embedding(
    fields: ["title", "plot"], 
    provider: "openai", 
    model: "text-embedding-3-small", 
    url: "https://api.openai.com/v1"
  )
}
```

```
export OPENAI_API_KEY=sk-...
```

## Ollama

```graphql title="Embedding field with Ollama model" test-setup-collection
type Book {
  title: String
  plot: String
  about_v: [Float32!] @embedding(
    fields: ["title", "plot"], 
    provider: "ollama", 
    model: "embeddinggemma", 
    url: "http://localhost:11434/api"
  )
}
```

:::tip
The model must be installed ahead

```
ollama pull embeddinggemma
```
:::

## Using templates

Template for combining fields, formatted as [Go template](https://pkg.go.dev/text/template#hdr-Actions) (ex. `{{ .name }} is {{ .age }} years old.`). The resulting string is the input to the embedding model.

## Storing embedding vectors

```go title="Autogen vectors"
&action.AddDoc{
    // Doc with both embedding fields
    Doc: `{
        "name": "John",
        "about": "He loves tacos."
    }`,
},
&action.AddDoc{
    // Doc with only one embedding field
    Doc: `{
        "name": "John"
    }`,
},
&action.Request{
    Request: `
        query {
            User {
                name_v
            }
        }
    `,
    Results: map[string]any{
        "User": []map[string]any{
            {
                "name_v": gomega.And(
                    gomega.BeAssignableToTypeOf([]float32{}),
                    gomega.HaveLen(768),
                ),
            },
            {
                "name_v": gomega.And(
                    gomega.BeAssignableToTypeOf([]float32{}),
                    gomega.HaveLen(768),
                ),
            },
        },
    },
},
```

```go title="Explicit vector values"
&action.AddCollection{
    SDL: `
        type User {
            name: String
            about: String
            name_v: [Float32!] @embedding(fields: ["name", "about"], provider: "ollama", model: "nomic-embed-text",  url: "http://localhost:11434/api")
        }
    `,
},
&action.AddDoc{
    Doc: `{
        "name": "John",
        "about": "He loves tacos.",
        "name_v": [1, 2, 3]
    }`,
},
&action.Request{
    Request: `
        query {
            User {
                _docID
                name_v
            }
        }
    `,
    Results: map[string]any{
        "User": []map[string]any{
            {
                "_docID": testUtils.NewDocIndex(0, 0),
                "name_v": []float32{1, 2, 3},
            },
        },
    },
},
```