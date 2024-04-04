---
title: Join
---

# How to join Testnet 1
The following will detail the necessary steps to join Testnet 1 Orbis Root Ring as a validator. Only the existing and approved validators can operate a Orbis node in the Root Ring.

## Hardware Requirements
Orbis doesn't have any specific requirements from a hardware perspective at the moment, however it is recommended to use a "good enough" datacenter machine. 

Orbis can be deployed along side your existing validator hardware as a co-process. Or on a seprate machine entirely. 

Minimum hardware requirements:
* 2-core amd64 CPU (or 2 virtual cores)
* 4GB RAM
* 32GB SSD Storage
* 100Mbps bi-directional internet connection.

## Orbis Binary
You can get the `orbisd` binary from the releases page of the Orbis repo: [https://github.com/sourcenetwork/orbis-go/releases/tag/v0.2.1](https://github.com/sourcenetwork/orbis-go/releases/tag/v0.2.1).
```bash
cd $HOME
wget https://github.com/sourcenetwork/orbis-go/releases/tag/v0.2.1
chmod +x orbisd
sudo mv /usr/bin
```

### From Source
You can download the code and compile your own binaries if you prefer. However you will need a local installation of the `go` toolchain at a minimum version of 1.21
```bash
cd $HOME
git clone https://github.com/sourcenetwork/orbis-go
cd orbis-go
git checkout v0.2.1
make build
cp ./build/orbisd $GOBIN/orbisd
export PATH=$PATH:$GOBIN
```
Now you will have the `orbisd` available in your local system.

## Docker
You can either use the pre-existing docker image hosted on our GitHub, or build your own

### Github Container Registry (coming soon)
`docker pull ghcr.io/sourcenetwork/orbis:0.2.1`

### Build Docker Image from Source
```bash
cd $HOME
git clone https://github.com/sourcenetwork/orbis-go
cd orbis-go
git checkout v0.2.1
docker build -t <name> .
```

## Docker Compose


## Initialization
To deploy our orbis node and to join the Root Ring running on [SourceHub Testnet 1](/sourcehub/testnet/overview), generate or use an existing sourcehub keypair, and update your respective configuration. 

Orbis will also need access to a running SourceHub Testnet 1 RPC Endpoint, this can either be:
* A) The RPC endpoint of your existing validator node, if you are running both daemons on a single machine
* B) Your own hosted RPC endpoint
* C) A public RPC endpoint
    * http://rpc1.testnet1.source.network:26657
    * http://rpc2.testnet1.source.network:26657

### Key Ring
As for the sourcehub keypair, Orbis needs access to a sourcehubd keyring instance. You already have one running on your validator node, but you can also create a keyring on any node with `sourcehubd keys add <keyname>`. If you are running both `orbisd` and `sourcehubd` on the same machine, then you can share keys between your validator and orbis node.

The `keyname` you have already, or if you create a new one, must match what you specify in the `orbis.yml` config, defined below.

By default `sourcehubd keys add <keyname>` will use the `os` keyring backend, you may use other key backends supported by the SourceHub keyring utility, but whatever backend you use *MUST* match what is in your `orbis.yml` config. To learn more about various backends you can see the documentation available from the `sourcehubd keys --help` command.

> [!WARNING]
> If when you start your node and you get an error similar to `error: bech32 decode ...` then you likely have either used the wrong `keyname` or `keyringBackend`.

## Configuration
You may have to configure orbis to work in your specific environment or hardware, depending on your storage and networking resources, here is a pretty standard configuration file `orbis.yml`
```yaml
grpc:
  # GRPC Endpoint
  grpcURL: "0.0.0.0:8080"
  # Rest API Endpoint (optional)
  restURL: "0.0.0.0:8090"
  # GRPC Request logging (true/false)
  logging: true

logger:
  # Default log level ("fatal", "error", "warn", "info", "debug")
  level: "info"

host:
  # P2P Host Address (multiaddress)
  listenAddresses:
    - /ip4/0.0.0.0/tcp/9000
  # P2P Boostrap peers
  bootstrap_peers:
    - /dns4/<SOURCEHUB_VALIDATOR_ADDRESS>/tcp/9001/p2p/<SOURCEHUB_VALIDATOR_PEERID>

transport:
  # P2P Peer exchange topic
  rendezvous: "orbis-transport"

db:
  # DB data store path, prefixed with $HOME/.orbis
  # So "data" would result in a path $HOME/.orbis/data
  path: "data"

cosmos:
  # Cosmos chain ID
  chainId: sourcehub-testnet1
  # Cosmos keyring key name
  accountName: <keyname>
  # Cosmos keyring backend ('os' is the default when running sourcehubd)
  keyringBackend: os
  # Cosmos address prefix ('source' is for SourceHub)
  addressPrefix: source
  # Transaction fees
  fees: 2000uopen
  rpcAddress: <RPC Address>
```

When starting an Orbis daemon, you can specify the config file path with the `--config <path>` flag. 

## Configuration Requirements
You *MUST* run orbis with a publicly available "Host Address". In the above example config this is the
```yaml
listenAddresses:
  - /ip4/0.0.0.0/tcp/9000
```

You can specify your own port to listen on, but the host port and bind address must result in a publicly available listener. This is the port that all the orbis nodes communicate their P2P network traffic.

The GRPC and Rest address/port don't necessarily have to be public, this can match whatever deployment environment you are currently using, however if you want to access these APIs from other machines, you must make the appropriate port and network rules to do so.

### Start your node
Once you have configured your keyring and config file, you can start you node.
```bash
orbisd start --config /path/to/orbis.yml
```
> [!IMPORTANT]
> When starting your orbis daemon, your configured `cosmos.rpcAddress` endpoint must be live, since it tries to connect to this endpoint immediatly upon startup. If you have any errors relating to `cosmos client` then you have either used the wrong `rpcAddress` or the RPC node isn't online.

### SystemD Service (Optional)
If you wish to use systemd to manage your daemon, you can use the following configuration.

Create the following file: `/etc/systemd/system/orbisd.service`
```bash
[Unit]
Description=Orbis service
After=network-online.target

[Service]
User=<user>
ExecStart=/<path-to>/orbisd start --config <path/to/orbis.yaml>
Restart=no
LimitNOFILE=4096

[Install]
WantedBy=multi-user.target
```

## Joining the Root Ring
The *Root Ring* is the Orbis deployment maintained by the validators of the SourceHub Testnet. The primary function of nodes maintaining the Root Ring is to create a shared keypair using a Distributed Key Generation (DKG) algorithm. 

A Orbis ring is defined by its *Manifest* which is a configuration that describes all the initial parameters of a ring, such as what DKG algorithm to use, how to authenticate and authorize requests, the threshold number of nodes required for a proxy-encryption, etc. You can think of a ring manifest similar to a network genesis file.

***Example Manifest***
```json
{
    "n": 3, // total number of initial nodes in the ring
    "t": 2, // threshold number of nodes for a proxy-encryption operation
    "dkg": "rabin", // DKG algorithm
    "pss": "avpss", // Proactive Secret Sharing algorithm
    "pre": "elgamal", // Proxy-Encyption algorithm
    "bulletin": "sourcehub", // bulletin board implementation
    "transport": "p2p", // networking transport
    "authentication": "jws-did", // encryption request authentication
    "authorization": "ACP", // encryption request authorization
    "nodes": [ // PeerIDs and Addresses of the initial nodes
        {"id":"16Uiu2HAm35sSr96x1TJHBTkWdcDH9P8twhTw92iDyq38XvyGzgZN","address":"/ip4/127.0.0.1/tcp/9001"},
        {"id":"16Uiu2HAmAVcM6V1PY8DdvzobyK5QZbwX5z3AA6wCSrCm6xUA79Xn","address":"/ip4/127.0.0.1/tcp/9002"},
        {"id":"16Uiu2HAkzjLLosHcV4LGvLY4vskda5NgMW4qmtfQ2uMbgFAoqghX","address":"/ip4/127.0.0.1/tcp/9003"}
    ],
    "nonce": 0 // nonce to alter the determinisic ring content identifier (CID)
}
```

### Creating the Root Ring Manifest
To create the Root Ring manifest we need all the initial nodes PeerIDs and P2P Addresses. In fact, the rest of the parameters of the Root Ring manifest will be the same as the example above, with the exception of
* `Number of nodes (n)`
* `Threshold number of nodes (t)`
* `Initial (nodes)`

The root ring manifest *cannot* be created until all existing validators start their Orbis nodes, and report back with the respective PeerIDs and Addresses.

Once you have a running node, you can get your PeerID and Address with the following command:
```bash
orbisd -s <grpc-address:port> transport-service get-host --transport p2p
```
This will respond back with something like:
```json
{
    "node":{
        "id":"16Uiu2HAm35sSr96x1TJHBTkWdcDH9P8twhTw92iDyq38XvyGzgZN",
        "address":"/ip4/127.0.0.1/tcp/9001",
        "publicKey":{
            "Type":"Secp256k1",
            "Data":"AnHK2Co3LgeLHo8tMsyfMlp0JXGL3y9yiPOAkQVknfrp"
        }
    }
}
```

Please post this *full* response in the [#validator-general](https://discord.com/channels/427944769851752448/1200236096089509918) channel, this is all public information, so no security details are being leaked.

Once all the current validators have started their nodes, and posted their host info, we can craft the Root Ring manifest.

### Create Root Ring
Once we have the Root Ring manifest, everyone can download it from the discord or Github testnet repo page (links to be provided here once we generate it), we can go ahread and create the root ring.

To do so, each node will need to run
```bash
orbisd -s <grpc-address:port> ring-service create-ring -f <path-to>/manifest.json
```

This will initialze the DKG process and you node will start generating its respective DKG Share. This process can't complete unless *all* nodes are online and syncing. Once completed, the Root Ring will have an initialized DKG, and is ready to start recieving `Store` and `ReEncrypt` requests!

If we have reached this step together without errors, then we will have completed the Orbis Root Ring setup! 

However, if there are errors experienced along the way, we may need to issue a software update, and restart the process. This is experimental and bleeding edge software, but we hopeful that we can collectively launch the Root Ring without any breaking or blocking issues.