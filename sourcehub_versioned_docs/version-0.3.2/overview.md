---
sidebar_position: 1
title: Overview
slug: /
---
# SourceHub Overview

![SourceHub Overview](/img/sourcehub-cover-copy.png)

SourceHub is the Source Network's trust protocol, which facilitates trusted and authenticated sharing and collaboration of data across the network and beyond. It utilizes [CometBFT](https://cometbft.com/) consensus and is built on the [Cosmos SDK](link) to provide us with a solid technical foundation to enable our decentralized infrastructure and application-specific chain.

The primary functions of SourceHub are:
- **ACP Module**: A decentralized authorization engine, inspired in part by [Google Zanzibar's](/sourcehub/concepts/zanzibar) Relational Based Access Control (RelBAC)

- **Bulletin Module**: A trust minimized network broadcast hub. Used both for DefraDBs Document Anchoring and [Orbis's](/orbis) [Multi-Party Computation (MPC)](https://en.wikipedia.org/wiki/Secure_multi-party_computation) to optimize its network communication to initialize and maintain the [Distributed Key Generation (DKG)](https://en.wikipedia.org/wiki/Distributed_key_generation)

- **Developer-Lock Tier Module** (:construction: coming soon :construction:): A SaaS inspired pricing module to streamline DevEx around tokenomics, abstract transaction gas, and simplify user wallet experience. Similar to [Account Abstraction](https://ethereum.org/en/roadmap/account-abstraction/) systems, but native to our protocol.

---

Although SourceHub is an independent system with self-contained functionality - like the rest of the Source Stack - it is designed to work in conjunction with [DefraDB](/defradb) nodes to help facilitate trust in its peer-to-peer architecture. 

![SourceHub+DefraDB](/img/sourcehub/trust-protocol-defradb.png)