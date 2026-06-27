---
title: Transactions
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

Transactions allow you to group together a number of database operations that must either succeed together or not at all. DefraDB wraps all database operations in transactions by default &ndash; you can however also manually start a transaction, enqueue a number of operations in it (ex. create or update a number of documents), and commit or discard it.

## Open transactions {/* #open */}

<Tabs groupId="defra">
  <TabItem value="cli" label="CLI" default>
    Open a new transaction with the CLI command [`defradb client tx new`](/references/cli/defradb_client_tx_new.md). The returned transaction ID is needed for all operations that want to act within this transaction.

    ```shell title="Example &ndash; Open a new transaction"
    defradb client tx new
    ```
    ```json title="Result"
    {"id":27}
    ```

    :::tip Expiration
    A transaction automatically expires after 60 seconds of inactivity. Tweak the default expiration with the flag `--ttl <seconds>`.
    :::
  </TabItem>
  <TabItem value="http" label="HTTP API">
    Open a new transaction by submitting a `POST` request to the HTTP endpoint [`/tx`](/defradb/references/http/api/new-transaction/). The returned transaction ID is needed for all operations that want to act within this transaction.

    ```http title="Example &ndash; Open a new transaction"
    POST http://localhost:9181/api/v1/tx HTTP/2
    accept: application/json
    ```
    ```json title="Result"
    {"id":27}
    ```

    :::tip Expiration
    A transaction automatically expires after 60 seconds of inactivity. Tweak the default expiration with the parameter `ttl=<seconds>`.
    :::
  </TabItem>
</Tabs>

## Run operations within transactions {/* #queries */}

<Tabs groupId="defra">
  <TabItem value="cli" label="CLI" default>
    Execute database operations (such as creating or altering collections/documents) within a transaction by providing the flag `--tx <id>` to the CLI commands running such operations.

    ```shell title="Example &ndash; Create a collection and a document within a transaction"
    defradb client collection add --tx 27 '
    type Book {
      title: String!
      plot: String
      rating: Float
    }
    '
    defradb client query --tx 27 '
    mutation {
      add_Book(input:{
        title: "The meaning of it all"
      }) { title }
    }
    '
    ```
  </TabItem>
  <TabItem value="http" label="HTTP API">
    Execute database operations (such as creating or altering collections/documents) within a transaction by providing the extra header `x-defradb-tx: <id>` to the HTTP requests running such operations.

    ```http title="Example &ndash; Create a collection within a transaction"
    POST http://localhost:9181/api/v1/collections HTTP/2
    accept: application/json
    content-type: text/plain
    x-defradb-tx: 27

    type Book {
      title: String!
      plot: String
      rating: Float
    }
    ```
    ```http title="Example &ndash; Create a document within a transaction"
    POST http://localhost:9181/api/v1/collections/Book HTTP/2
    accept: application/json
    content-type: application/json
    x-defradb-tx: 27

    {
      "title": "The meaning of it all"
    }
    ```
  </TabItem>
</Tabs>

## Commit transactions {/* #commit */}

<Tabs groupId="defra">
  <TabItem value="cli" label="CLI" default>
    Commit a transaction with the CLI command [`defradb client tx commit`](/references/cli/defradb_client_tx_commit.md), providing the ID of an open transaction. All changes get written into memory.

    ```shell title="Example &ndash; Commit the transaction with ID 27"
    defradb client tx commit 27
    ```
  </TabItem>
  <TabItem value="http" label="HTTP API">
    Commit a transaction by submitting a `POST` request to the HTTP endpoint [`/tx/:id`](/defradb/references/http/api/new-transaction/), providing the ID of an open transaction as value for `:id`. All changes get written into memory.

    ```http title="Example &ndash; Commit the transaction with ID 27"
    POST http://localhost:9181/api/v1/tx/27 HTTP/2
    accept: application/json
    ```
  </TabItem>
</Tabs>

## Discard transactions {/* #discard */}

<Tabs groupId="defra">
  <TabItem value="cli" label="CLI" default>
    Discard a transaction with the CLI command [`defradb client tx discard`](/references/cli/defradb_client_tx_discard.md), providing the ID of an open transaction. All changes enqueued in the transaction are discarded.

    ```shell title="Example &ndash; Discard the transaction with ID 27"
    defradb client tx discard 27
    ```
  </TabItem>
  <TabItem value="http" label="HTTP API">
    Discard a transaction by submitting a `DELETE` request to the HTTP endpoint [`/tx/:id`](/defradb/references/http/api/discard-transaction/), providing the ID of an open transaction as value for `:id`. All changes enqueued in the transaction are discarded.

    ```http title="Example &ndash; Discard the transaction with ID 27"
    DELETE http://localhost:9181/api/v1/tx/27 HTTP/2
    accept: application/json
    ```
  </TabItem>
</Tabs>