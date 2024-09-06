# Create a Secret Ring

***To skip ahead to <u>using an existing</u> Secret Ring deployment,
proceed to [Storing a Secret](./secrets).***

---

Secret Rings are a deployments of Orbis nodes with a single shared [distributed key pair](/orbis/concepts/dkg). To create a Secret Ring, you'll need a minimum of 3 Orbis nodes.

## Docker Compose
The easiest method to get a local Secret Ring deployed is with our Docker Compose setup, which will initialize 3 orbis nodes, as well as the authorization service (Zanzi), and finally will bootstrap the peer-to-peer network. You will need **both** docker and docker-compose setup locally.

:::warning
The following demo docker compose file uses deterministic private keys and ***IS NOT*** suitable for production deployments. Use at your own risk.
:::

The docker compose file is hosted in the `demo/zanzi` folder on the Orbis repo, found [here](https://github.com/sourcenetwork/orbis-go/blob/develop/demo/zanzi/compose.yaml).

To run the docker compose file
```bash
cd $HOME
git clone https://github.com/sourcenetwork/orbis-go
cd orbis-go
docker-compose -f demo/zanzi/compose.yaml up
```

## Ring Manifest
The Ring Manifest is the genesis file that describes the initial parameters of a Secret Ring. This includes the authentication and authorization schemes, which DKG protocol to use, etc. Importantly, it also has the addresses and `PeerIDs` of the nodes that will initialize the Ring.

Here is the manifest for the root ring we will create for the set of nodes we have created with the docker-compose script above. To learn more about each parameter, please refer to the [Manifest Reference](/orbis/reference/manifest) doc.
```json
{
    "manifest": {
        "n": 3,
        "t": 2,
        "dkg": "rabin",
        "pss": "avpss",
        "pre": "elgamal",
        "bulletin": "p2p",
        "transport": "p2p",
        "authentication": "jws-did",
        "authorization": "zanzi",
        "nodes": [
            {
                "id":"16Uiu2HAmLyq5HXHSFxvxmGcsnwsYPZvTDtfe3CYnWDK8jDAHhJC5",
                "address":"/ip4/127.0.0.1/tcp/9000"
            },
            {
                "id":"16Uiu2HAmR7vXGm8Zohvs6cD3PtGSyAUFRDWypsAcmkiyMYTLhEe4",
                "address":"/ip4/23.88.72.49/tcp/9000"
            },
            {
                "id":"16Uiu2HAmVBRogwVBbByVvsYywp2jUNBqfe1zTFNtaVMRvSyUndPX",
                "address":"/ip4/138.201.36.107/tcp/9000"
            },
        ],
        "nonce": 0
    }
}
```

Save the above manifest defition to `manifest.json`. Then we can initialize the ring on each node in the ring. Each node *must* be configured independently with the `create-ring` command.

```bash
# Run on each node
orbisd -s <grpc-address> ring-service create-ring -f <path-to>/manifest.json
```

This will initialze the DKG process and you node will start generating its respective DKG Share. This process can't complete unless all nodes are online and syncing. Once completed, the Secret Ring will have an initialized DKG, and is ready to start recieving Store and ReEncrypt requests!

## Orbis Client
```bash
# Env Vars
export ORBIS_CLIENT_FROM="alice"
export ORBIS_CLIENT_SERVER_ADDR=":8081"
export ORBIS_CLIENT_AUTHZ_ADDR=":8080"
export ORBIS_CLIENT_RING_ID="zQ123"

# Create Policy
orbisd client policy create -f policy.yaml => policy-id=0x123
orbisd client policy describe 0x123 => policy-data=...

# Create Secret (managed authorization)
orbisd client put "mysecret" --authz managed --policy 0x123 --resource secret --permission read
orbisd client get ABC123

# Create Secret (unmanaged authorization)
orbisd client policy register 0x123 secret mysecret
orbisd client put "mysecret" --authz unmanaged --permission "0x123/secret:mysecret#read"
orbisd client get ABC123

# Add Bob as a reader
orbisd client policy set 0x123 secret mysecret collaborator did:key:bob
orbisd client policy check 0x123 did:key:bob secret:mysecret#read => valid=true/false
```