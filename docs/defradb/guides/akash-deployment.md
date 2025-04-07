---
sidebar_label: Akash Deployment Guide
sidebar_position: 60
---
# Akash Deployment Guide

## Overview

This guide walks you through deploying DefraDB—a local-first data management solution—on Akash, a distributed infrastructure platform optimized for edge compute.

By following these steps, applications can seamlessly manage data close to where it's generated, leveraging edge resources and embedded infrastructure.

## Prerequisites

Before proceeding, ensure you have:

- An Akash account with at least 5 AKT available.
- The Keplr wallet installed. If not, download it from [Keplr's official site](https://www.keplr.app/).

## Deploy

![Cloudmos console](/img/akash/deploy.png "Cloudmos console")

The easiest way to deploy on Akash is by using the [Cloudmos console](https://deploy.cloudmos.io/new-deployment).

1. **Open Cloudmos** and select the **“Empty”** deployment type.
1. **Paste the configuration** below into the editor.

    ```yaml
    ---
    version: "2.0"

    services:
      defradb:
        image: sourcenetwork/defradb:develop
        args:
          - start
          - --url=0.0.0.0:9181
        expose:
          - port: 9171
            as: 9171
            to:
              - global: true
          - port: 9181
            as: 80
            to:
              - global: true

    profiles:
      compute:
        defradb:
          resources:
            cpu:
              units: 1.0
            memory:
              size: 1Gi
            storage:
              size: 1Gi
      placement:
        akash:
          attributes:
            host: akash
          signedBy:
            anyOf:
              - "akash1365yvmc4s7awdyj3n2sav7xfx76adc6dnmlx63"
              - "akash18qa2a2ltfyvkyj0ggj3hkvuj6twzyumuaru9s4"
          pricing:
            defradb: 
              denom: uakt
              amount: 10000

    deployment:
      defradb:
        akash:
          profile: defradb
          count: 1 
    ```

1. Click **"Create Deployment."**  
   Confirm the configuration transaction when prompted.

1. **Choose a provider**—select one that meets your location and pricing needs.

1. Finalize by approving the **deployment transaction**.

Upon successful deployment, you’ll be presented with status details as shown in the sample image below.

![Cloudmos deployment](/img/akash/info.png "Cloudmos deployment")

## Accessing Deployment Details

To manage and interact with your **DefraDB** node, you’ll need two key components:

- **API Address**
- **P2P Address**

These addresses can be found in your deployment summary. They enable communication between your local-first application and the embedded remote instance.

## Enabling P2P Replication

To replicate data between your **local DefraDB node** and your **edge-deployed Akash node**, follow these steps:

### 1. Create a Shared Schema

Run the following command on your **local node** to define a schema:

```bash
defradb client schema add '
    type User {
        name: String
        age:  Int
    }
'
```

Then, create the same schema on the **Akash node**, replacing `<api_address>` with your actual deployed endpoint:

```bash
defradb client schema add --url <api_address> '
    type User {
        name: String
        age:  Int
    }
'
```

> Your API address can be found in the **Deployment Info** section.

### 2. Retrieve Peer Information

To connect your local node to the edge deployment, you’ll need the Akash node’s **Peer ID** and P2P bind address.

Run this command:

```bash
defradb client p2p info --url <api_address>
```

Example output:

```json
{
  "ID": "12D3KooWQr7voGBQPTVQrsk76k7sYWRwsAdHRbRjXW39akYomLP3",
  "Addrs": [
    "/ip4/0.0.0.0/tcp/9171"
  ]
}
```

Note: This is the **bind address**. The **public P2P address** for external communication is found in your deployment info.

### 3. Set Up the Replicator

Establish a replicator from your **local node** to the **embedded node** by executing:

```bash
defradb client p2p replicator set --collection User '{
    "ID": "12D3KooWQr7voGBQPTVQrsk76k7sYWRwsAdHRbRjXW39akYomLP3", 
    "Addrs": [
        "/dns/<p2p_address_host>/<p2p_address_port>"
    ]
}'
```

Replace:

- `<p2p_address_host>` with your node's host (e.g., `provider.bdl.computer`)
- `<p2p_address_port>` with the respective port (e.g., `32582`)

> These details are available in the deployment panel.

## Conclusion

Your **local-first application** is now replicating data to the **edge node** hosted on Akash. This setup supports fault-tolerant, resilient data management across distributed infrastructure, optimized for embedded systems and proximity to the data source.
