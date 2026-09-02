---
title: Vector embeddings
description: .
---

```go
directive @embedding(
    "The fields to pass to the model."
    fields: [String]
    "The model to use for embedding. (nomic-embed-text, etc.)"
    model: String
    "The provider to use for embedding. (ollama, openAI, etc.)"
    provider: String
    "The template to use with the fields to create the content to feed the model."
    template: String
    "The URL of the provider API."
    url: String
) on FIELD_DEFINITION
```

```graphql
type Users {
    about: String
    about_v: [Float32!] @embedding(fields: ["about"], provider: "openai", model: "text-embedding-3-small",  url: "https://api.openai.com/v1")
}
```

```graphql
type Users {
    name: String
    name_v: [Float32!] @embedding(fields: ["name"], provider: "ollama", model: "nomic-embed-text",  url: "http://localhost:11434/api")
}
```

```go title="Autogen vectors"
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