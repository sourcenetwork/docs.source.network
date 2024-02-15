---
title: Join
sidebar_position: 2
---

# How to join Testnet 1
The following will detail the necessary steps to join Testnet 1 as a validator. Only approved validators can join testnet 1 as we have not yet enabled permissionless public validator sets.

## Hardware Requirements
Firstly any validator joining the network must ensure they have sufficient server hardware to ensure the network meets its current performance targets. 

* x86-64 (amd64) multi-core CPU (AMD / Intel)
* 16GB RAM
* 256GB SSD Storage
* 100Mbps bi-directional Internet connection

## SourceHub Binary

### Precompiled
You can get the `sourcehubd` binary from the releases page of the SourceHub repo: https://github.com/sourcenetwork/sourcehub/releases/tag/v0.2.0
```bash
cd $HOME
wget https://github.com/sourcenetwork/sourcehub/releases/download/v0.2.0/sourcehubd
chmod +x sourcehubd
sudo mv /usr/bin
```


### From Source
You can download the code and compile your own binaries if you prefer. However you will need a local installation of the `go` toolchain at a minimum version of 1.21
```bash
cd $HOME
git clone https://github.com/sourcenetwork/sourcehub
cd sourcehub
git checkout v0.2.0
make install
export PATH=$PATH:$GOBIN
```
Now you will have the `sourcehubd` available in your local system.

## Initialization
To join the network you need to initiaze your node with a keypair, download the genesis file, and update your configurations.

```bash
# You must specify your own moniker, which is a label for your node
sourcehubd init <moniker> --chain-id sourcehub-testnet1

# Download the Genesis
cd $HOME
wget https://raw.githubusercontent.com/sourcenetwork/networks/testnet/testnet1/genesis.json
mv genesis.json $HOME/.sourcehub/config/genesis.json

# Update your configuration
cd $HOME/.sourcehub/config
sed -i 's/minimum-gas-prices = ""/minimum-gas-prices = "0.001uopen"/' app.toml
sed -i 's/persistent_peers = ""/persistent_peers = "2da42ce7b32cb76c3a86db2eadfab8508ee41815@54.158.208.103:26656"/' config.toml

# Update timeouts
sed -i 's/timeout_propose = "3s"/timeout_propose = "500ms"/' config.toml
sed -i 's/timeout_commit = "5s"/timeout_commit = "1s"/' config.toml
```

### State Sync (Recommended)
At this point you can start your node and it will begin syncing with the rest of the network starting from height 0. However, this process can take several hours to complete. Instead nodes can use the ***much*** faster State Sync system that automatically downloads a snapshot from other nodes at a specific trusted height, and will sync from this point onwards. This process only takes a couple of minutes.

```bash
cd $HOME/.sourcehubd/config
# Configure Trusted blocks
sed -i 's/enable = false/enable = true/' config.toml
sed -i 's/trust_height = 0/trust_height = <BLOCK_HEIGHT>/' config.toml
sed -i 's/trust_hash = ""/trust_hash = "<BLOCK_HASH>"/' config.toml
sed -i 's/rpc_servers = ""/rpc_servers = "http:\/\/rpc1.testnet1.source.network:26657,http:\/\/rpc2.testnet1.source.network:26657"/' config.toml

# Download snapshot
cd $HOME
export BLOCK_HEIGHT=<BLOCK_HEIGHT>
wget https://sourcehub-snapshot.s3.amazonaws.com/testnet-1/$BLOCK_HEIGHT-3.tar.gz
sourcehubd snapshots load $BLOCK_HEIGHT-3.tar.gz
sourcehubd snapshots restore $BLOCK_HEIGHT 3
sourcehubd comet bootstrap-state
```

You can get the `<BLOCK_HEIGHT>` and `<BLOCK_HASH>` from the `#validator-info` channel in the Validator section of the [Source Network Discord](https://discord.source.network)

### SystemD Service (Optional)

Create the following file: `/etc/systemd/system/sourcehubd.service`
```bash
[Unit]
Description=SourceHub service
After=network-online.target

[Service]
User=<user>
ExecStart=/<path-to>/sourcehubd start --x-crisis-skip-assert-invariants
Restart=no
LimitNOFILE=4096

[Install]
WantedBy=multi-user.target
```

You must specify/edit the `<user>` and `<path-to>` of your system in the SystemD service file.

#### Start the service

```bash
# Restart SystemD
systemctl daemon-reload
systemctl restart systemd-journald

# Start the SourceHub service
systemctl enable sourcehubd.service
systemctl start sourcehubd.service
```

To follow the service log, run `journalctl -fu sourcehubd`

## Register your validator
Once you have your node running and synchronized with the rest of the network you can register as a Validator. 

First, we want to create a local keypair. This keypair is independant of your validator, and can exist on any node, but we need one to submit transactions to the network, like the `create-validator` transaction.
```bash
sourcehubd keys add <key_name>
```

Make sure to backup the newly created keypair. Then, go to the Source Network [Faucet](https://faucet.source.network/) and get some `$OPEN` tokens so you can pay for transaction gas.

You also need to post your key address to the `#validator-general` chat on the [Source Network Discord](https://discord.source.network) so you can recieve your minimum `stake` tokens. These stake tokens are used to determine voting power in the network, and are seperate from the `$OPEN` tokens used for gas.

Once you have recieved your `stake` tokens from the Source Network team you can create you validator wit the following commands.

```bash
# Create Validator info json config
# Update the moniker, website, security, and details
cd $HOME
echo "{
        \"pubkey\": $(sourcehubd comet show-validator),
        \"amount\": \"1stake\",
        \"moniker\": \"<choose a moniker>\",
        \"website\": \"validator's (optional) website\",
        \"security\": \"validator's (optional) security contact email\",
        \"details\": \"validator's (optional) details\",
        \"commission-rate\": \"0\",
        \"commission-max-rate\": \"0\",
        \"commission-max-change-rate\": \"0\",
        \"min-self-delegation\": \"1\"
}" > validator.json

# Create validator transaction
sourcehubd tx staking create-validator validator.json --from=<key_name> --fees 1000uopen -y
```

Where the `<key_name>` is the same key you made from above.

If the transaction is successful, you now have an *in-active* validator on SourceHub Testnet 1.  To become active, you must post your validator address `$> sourcehubd comet show-address` in the `#validator-general` chat on the [Source Network Discord](https://discord.source.network), and we will delegate voting power to you, which will move you into the *active* validator set, and you'll node will start producing and verifying blocks.

> The SourceHub Testnet 1 is a public but permissioned network, meaning only approved validators can join the network. This is guranteed by the fact that Source owns 100% of the staking power of the network.
