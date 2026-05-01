---
title: Replicator P2P
---

Replicator peering is _targeted_: it allows a node to actively send updates to another node. Let's go through an example of *nodeA* actively replicating to *nodeB*:

Start *nodeA*:

```shell
defradb start
```

Create a new collection `Article`:

```shell
defradb client collection add '
  type Article {
    content: String
    published: Boolean
  }
'
```

Start *nodeB*, which will be receiving updates:

```shell
defradb start --rootdir ~/.defradb-nodeB --url localhost:9182 --p2paddr /ip4/0.0.0.0/tcp/9172
```

:::note

We *do not* specify `--peers` as we will manually define a replicator after startup via the `client p2p replicator` command.

:::

Add the same collection to *nodeB*:

```shell
defradb client collection add --url localhost:9182 '
  type Article {
    content: String
    published: Boolean
  }
'
```

Then copy the peer info from *nodeB*:

```shell
defradb client p2p info --url localhost:9182
```

Set *nodeA* to actively replicate the Article collection to *nodeB*:

```shell
defradb client p2p replicator add -c Article /ip4/0.0.0.0/tcp/9172/p2p/<nodeB-peerID>
```

As you add or update documents in the `Article` collection on *nodeA*, they will be pushed to *nodeB*.

:::info

Changes to *nodeB* will still be passively published back to *nodeA* via pubsub.

:::
