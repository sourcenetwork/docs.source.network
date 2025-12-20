---
sidebar_label: Peer-to-peer how-to guide
sidebar_position: 10
---

# Peer-to-peer how-to guides

This guide provides step-by-step instructions for configuring and managing peer-to-peer networking in DefraDB.

## Prerequisites

Before following these guides, ensure you have:

- DefraDB installed on your system
- Basic familiarity with command-line interfaces
- Understanding of [P2P networking concepts](../Concepts/peer-to-peer.md)

## Start and configure DefraDB

### Start DefraDB with P2P enabled (default)

P2P networking is enabled by default when you start DefraDB:

```bash
defradb start
```

You'll see output similar to:

```bash
Jan 2 10:15:49.124 INF cli Starting DefraDB
Jan 2 10:15:49.161 INF net Created LibP2P host PeerId=12D3KooWEFCQ1iGMobsmNTPXb758kJkFc7XieQyGKpsuMxeDktz4 Address=[/ip4/127.0.0.1/tcp/9171]
Jan 2 10:15:49.162 INF net Starting internal broadcaster for pubsub network
```

### Start DefraDB without P2P

To disable P2P networking:

```bash
defradb start --no-p2p
```

### Change the P2P port

By default, DefraDB listens on port `9171`. To use a different port:

```bash
defradb start --p2paddr /ip4/<ip_address>/tcp/<port>
```

Example:

```bash
defradb start --p2paddr /ip4/0.0.0.0/tcp/9172
```

**Parameters**:

- Replace `<ip_address>` with your actual IP address (use `0.0.0.0` to listen on all interfaces)
- Replace `<port>` with your desired port number

## Manage Peer IDs

### Get your Peer ID

To retrieve your node's Peer ID using HTTP:

```bash
defradb client p2p info
```

The Peer ID is generated from a private key created during the first startup and remains consistent across restarts.

## Connect to peers

### Connect to a specific peer

To connect to a particular peer when starting DefraDB:

```bash
defradb start --peers /ip4/<ip_address>/tcp/<port>/p2p/<peer_id>
```

Example:

```bash
defradb start --peers /ip4/192.168.1.100/tcp/9171/p2p/12D3KooWEFCQ1iGMobsmNTPXb758kJkFc7XieQyGKpsuMxeDktz4
```

**Parameters**:

- Replace `<ip_address>` with the peer's IP address
- Replace `<port>` with the peer's P2P port
- Replace `<peer_id>` with the peer's Peer ID

## Manage document subscriptions (passive replication)

Passive replication works at the document level. Subscribe to specific documents to receive updates automatically.

### Subscribe to document updates

```bash
defradb client p2p document add <docID>
```

Example:

```bash
defradb client p2p document add bae-619ea0d2-35ba-5e8c-ac4d-2b769937213b
```

### Unsubscribe from document updates

```bash
defradb client p2p document remove <docID>
```

### View all active document subscriptions

```bash
defradb client p2p document getall
```

## Manage collection subscriptions (active replication)

Active replication can work at the collection level, allowing you to replicate entire collections to specific peers.

### Subscribe to collection updates

```bash
defradb client p2p collection add <collectionID>
```

### Unsubscribe from collection updates

```bash
defradb client p2p collection remove <collectionID>
```

### View all active collection subscriptions

```bash
defradb client p2p collection getall
```

### Add a replicator using CLI

```bash
defradb client p2p replicator set -c <collection_name> <peer_id>
```

Example:

```bash
defradb client p2p replicator set -c Books 12D3KooWEFCQ1iGMobsmNTPXb758kJkFc7XieQyGKpsuMxeDktz4
```

**Note**: Currently, replicators don't persist through node restarts. You'll need to re-add them after each restart. This limitation will be addressed in a future release.

## Troubleshooting

### Verify P2P is running

Check the startup logs for confirmation that the LibP2P host was created and the P2P network is active:

```
INF net Created LibP2P host PeerId=... Address=[...]
INF net Starting internal broadcaster for pubsub network
```

### Connection issues within home networks

If peers can't connect within the same home Wi-Fi network, this is typically due to NAT firewall restrictions. Consider:

1. Using circuit relays (a publicly accessible third-party node as an intermediary)
2. Configuring NAT hole punching
3. Connecting peers through the internet rather than the local network

See the [P2P Concepts](../Concepts/peer-to-peer.md) page for more information on NAT traversal.
