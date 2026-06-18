---
title: DQL Query Language overview
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

The DefraDB Query Language (DQL) allows you to store and query data in a DefraDB node. Based on [GraphQL](https://graphql.org), at a high level it has two type of operations: _query_ and _mutation_ blocks.

- **Query blocks** &ndash; The *read* side of DQL. Retrieve data without the ability to alter it.
- **Mutation blocks** &ndash; The *write* side of DQL. Mutations rely on the query system to pinpoint the data to update or delete.

As GraphQL queries and mutations must always return some fields, all blocks return a JSON object:

```json title="Return object structure"
{
  "data": {
    "<type>": [
      <documentObject>
    ]
  }
}
```

- `<type>` &ndash; Object type, such as a [collection](/schema/collections.md) name.
- `<documentObject>` &ndash; Return object for each selected document.

In case of error, the `data` object is `null` and the `error` object contains the error details:

```json title="Error object structure"
{
  "errors": [
    {
      "message": "Field \"Book\" of type \"[Book]\" must have a sub selection."
    }
  ],
  "data": null
}
```