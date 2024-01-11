---
sidebar_position: 6
title: Testnet1
---
# Testnet1

## Introduction
Testnets are essential for developing and testing blockchain networks before they go live on the mainnet. They consist of nodes running specific blockchain protocols and modules that enhance the functionality of the DefraDB.

The SourceHub protocol operates continuously, with decentralized and cryptographically designed API endpoints. Its purpose is to offer developers a condensed representation of the complete stack. This article explores key aspects of Source's Testnet1, its significance, deployment, and management.

## Core Components of the Protocol
The Source Network ecosystem protocol, based on CosmosSDK and utilizing CometBFT as its consensus mechanism in the SourceHub Testnet is driven by two interconnected components:

1. **Database**: Tailored for off-chain data querying, featuring a graph-like topple structure.

2. **Trust Protocol**: Operating on-chain, complementing the database with specific features.

These components form the foundational core of Source Network and comprise of four essential modules:

1. **Access control**: A general-purpose black box for the off-chain database, using a graph-like topple.

2. **Secret management**: Authorizing nodes through encryption and cryptography, with the Orbis secret management engine utilizing decentralized key pairs.

3. **Anchoring**: Facilitating strict event authoring for timestamping data, essential for blockchain's time-stamping service.

4. **Auditing**: Ensuring transparency and integrity within the protocol.

## Core Features and Goals of Testnet1

SourceHub Testnet1 serves as the initial MVP, featuring fundamental components necessary for application development. It provides an early-stage interaction with the protocol, excluding aspects like Tokenomics and advanced functionalities such as Secret Management and Authoring.
 

Key Points:

1. **Comprehensive MVP** - Testnet1 has limitations in ACP, Orbis, and Anchoring, alongside the absence of token economics, serving as a comprehensive MVP for the complete Source Network Stack.

2. **Permissioned Nature**: The network's permissioned nature, limited validator count, and the need for whitelisting underscore Testnet1's exclusive participation criteria.

3. **Developer Engagement**: Active developer participation is encouraged, with an emphasis on feedback and monitoring system performance metrics.

4. **Public Fairly Permissioned Network**: Testnet1 is positioned as a public fairly permissioned network, requiring whitelisting for SourceHub participation.

5. **Chain Independence**: The absence of IPC chains or connections to the chain highlights Testnet1's independent operational framework.

6. **Interoperability Focus**: The emphasis is on enhancing interoperability beyond the initial Testnet1 phase. This enables the Source ecosystem to interact and exchange information with other blockchain networks. And also provide a more connected and decentralized ecosystem.

The ultimate goal is the seamless progression through Testnet1 and towards the Mainnet, with ongoing evolution in core components, exposed features, and adjusted node requirements.

This progression involves considerations such as gRPCs (Mainnet) endpoints, P2P connectivity, and dependencies on the BFT-based CosmosSDK protocol.

```
grpc:
  grpcURL: "0.0.0.0:8081"
  restURL: "0.0.0.0:8091"
  logging: true
```

## Token Distribution and Developer Support
For testing purposes, developers require tokens in their local wallets, obtained through a faucet. These tokens, not actual coins, facilitate transactions within the testnet and cover gas fees. A user-friendly faucet serves as an API endpoint/tool for accessing dummy money.

## Running a Node

### Hardware Requirements
For effective participation in the Testnet, certain hardware specifications are essential for running a node as a validator. The key considerations encompass network capability, persistence, and connections. The specified hardware requirements include:

* x86-64 (amd64) multi-core CPU (AMD / Intel)
* 64GB RAM
* 1TB NVMe SSD Storage
* 100Mbps bi-directional Internet connection

### Installation
The installation is divided into two components:

1. SourceHub Daemon (SourceHub D): This is also referred to as node software, and is interchangeable with the SourceHub Daemon. The binaries for SourceHub D are named `sourcehubd`.

2. Orbis Daemon (Orbis D): The binaries for Orbis D are named `orbisd`.

 

There are different options for installation, they are:

* **Build from Source Network**: To install with this method, follow these steps:

    ```
    git clone [repo]
    git checkout [specific version tag]
    make build [this does all compilation necessary for the chain]
    run orbis d version [to test if the installation works]
    ```
 

* **Pre-compiled Binaries**: The released binaries are available on the GitHub release pages.

* **Docker Image**: This method of installing involves building a Docker image.  

### Configuration
Configuration for running SourceHub and Orbis includes settings for the daemon and requires matching local machine IP addresses for Node and RPC addresses.

Specific values like address prefix and account name must be obtained from local configurations.

 

**Note**:

* Specific values for address prefix and account name need to be obtained from your local configuration.

    ```
    bulletin:
     p2p:
        rendezvous: "orbis-bulletin"
     sourcehub:
        accountName: "<name>"
        addressPrefix: "<prefix>"
        nodeAddress: "<nodeAddress>"
        rpcAddress: "<rpcAddress>"
    ```

 


* Remove the crypto section (specifically host_crypto_seed) from the config file.
    ```
    host:
      crypto:
        seed: 1
      listenAddresses:
        - /ip4/0.0.0.0/tcp/9001 
    ```

 

* Update the config file accordingly.

## Public Bootstrapping Nodes and RPC Endpoints
Public bootstrapping nodes and RPC endpoints are essential components for network initiation. For SourceHub, the hardware requirements align with those for CosmosSDK chains, making CometBFT compatible.

## Validators

### Validator Role and Requirements
Validators play a crucial role in the blockchain by committing new blocks through an automated voting process. If a validator becomes unavailable or sign blocks at the same height, their stake faces the risk of being slashed.

Maintaining and monitoring validator nodes is crucial for optimal performance. Interested participants can join the waitlist to become a validator.

### How to Become a Testnet Validator
To become a Testnet validator, follow these steps:

* Run a Full Node - Ensure synchronization with the network.
* Fund Your Wallet - Use project tokens to delegate funds to your validator.
* Create a Validator - Execute the relevant command.
* Confirm Validator Creation - Verify the successful creation of the validator.
* Import CLI Commands - Follow the necessary CLI commands for continued participation.

## Conclusion
Source's Testnet1 serves as a foundational MVP, offering developers a preview of core components—Access Control, Secret Management, Document Anchoring and Auditing—while acknowledging limitations and emphasizing the network's permissioned nature.

The outlined hardware requirements and steps for becoming a validator provide a clear pathway for interested participants.