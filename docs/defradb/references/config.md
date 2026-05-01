---
sidebar_label: Configuration settings
sidebar_position: 1
---

# DefraDB configuration (YAML)

DefraDB's configuration file is called `config.yaml` and located within DefraDB root directory.

The default root directory is `$HOME/.defradb`. It can be changed via the `--rootdir` CLI flag when starting a node with `defradb start`.

::::tip

Relative paths in config settings are interpreted as relative to the DefraDB root directory.

::::

## `api.address`

Address of the HTTP API to listen on or connect to. Default: `127.0.0.1:9181`.

## `api.allowed-origins`

List of origins a cross-domain request can be executed from.

## `api.pubkeypath`

Path to the public key file for TLS / HTTPS.

## `api.privkeypath`

Path to the private key file for TLS / HTTPS.

## `datastore.badger.path`

Path to the database data files. Default: `data`.

## `datastore.badger.valuelogfilesize`

Maximum file size of the value log files. Default: `2^30`.

## `datastore.defaultkeytype`

Key type for `node-identity-key`: either `secp256k1` or `ed25519`. Default: `secp256k1`.

See [Keys](./keys.md).

## `datastore.maxtxnretries`

Number of retries to make in the event of a transaction conflict. Default: `5`.

This is only used within the P2P system and does not affect operations initiated by users.

## `datastore.noencryption`

Whether to skip generating an encryption key and disable encryption at rest. Default: `false`.

::::warning

The value of this option cannot be changed after the instance is started for the first time.

::::

## `datastore.nosearchableencryption`

Whether to skip generating a searchable encryption key and disable searchable encryption. Default: `false`.

## `datastore.nosigning`

Whether to skip signing new blocks.

::::warning

The value of this option cannot be changed after the instance is started for the first time.

::::

## `datastore.store`

Store mode. Options are:

- `badger`: fast pure Go key-value store optimized for SSDs (https://github.com/dgraph-io/badger).
- `memory`: in-memory version of `badger`.

Default: `badger`.

## `development`

Enables a set of features that facilitates development but should not be enabled in production:

- allows purging of all persisted data
- generates temporary node identity if one doesn't exist in the keyring

Default: `false`.

## `log.colordisabled`

Whether to disable colored log output. Default: `false`.

## `log.format`

Log format to use. Options are `text` or `json`. Default: `text`.

## `log.level`

Log level to use. Options are `info` or `error`. Default: `info`.

## `log.output`

Log output stream. Options are `stderr` or `stdout`. Default: `stderr`.

## `log.overrides`

Logger config overrides. Format

```format title="Logger config overrides format"
<name>,<key>=<val>,...;<name>,...
```

## `log.source`

Include a partial stacktrace in logs. Default: `true`.

## `log.stacktrace`

Whether to include the stacktrace in error and fatal log entries. Default: `false`.

## `net.p2paddresses`

List of addresses for the P2P network to listen on. Default: `[/ip4/127.0.0.1/tcp/9171]`.

## `net.p2pdisabled`

Whether P2P networking is disabled. Default: `false`.

## `net.peers`

List of peers to bootstrap with, specified as [multiaddresses](https://docs.libp2p.io/concepts/addressing/).

## `net.pubsubenabled`

Whether PubSub is enabled. Default: `true`.

## `net.relay`

Whether libp2p's [Circuit relay transport protocol](https://docs.libp2p.io/concepts/circuit-relay/) is enabled. Default: `false`.

## `keyring.backend`

Keyring backend to use. Options are:

- `file`: Store keys in encrypted files
- `system`: Store keys in the OS-managed keyring

Default: `file`.

## `keyring.disabled`

Whether to disable the keyring and generate ephemeral keys instead. Default: `false`.

## `keyring.namespace`

Service name to use when using the system keyring. Default: `defradb`.

## `keyring.path`

Path to store encrypted key files in. Default: `keys`.

## `replicator.retryintervals`

List of durations (in seconds) to wait before retrying a failed replication attempt. Default: `[30, 60, 120, 240, 480, 960, 1920]`.

## `secretfile`

Path to the file containing secrets. Default: `.env`.

## `telemetry.disabled`

Whether to disable telemetry. Default: `false`.

## `lens.runtime`

The LensVM wasm runtime to run lens modules in.

Possible values:
- `wasm-time` (default): https://github.com/bytecodealliance/wasmtime-go
- `wasmer` (windows not supported): https://github.com/wasmerio/wasmer-go
- `wazero`: https://github.com/tetratelabs/wazero

## `acp.document.type`

Type of Access Control Policy module to use. Options are:

- `none`: Disabled
- `local`: Local-only ACP
- `source-hub`: [SourceHub ACP](https://github.com/sourcenetwork/sourcehub)

Default: `none`.

## `acp.document.sourceHub.ChainID`

The ID of the SourceHub chain to store ACP data in. Required when using `acp.document.type`:`source-hub`.

## `acp.document.sourceHub.GRPCAddress`

The address of the SourceHub GRPC server. Required when using `acp.document.type`:`source-hub`.

## `acp.document.sourceHub.CometRPCAddress`

The address of the SourceHub Comet RPC server. Required when using `acp.document.type`:`source-hub`.

## `acp.docyment.sourceHub.KeyName`

The name of the key in the keyring containing the SourceHub credentials used to sign (and pay for) SourceHub transactions created by the node. Required when using `acp.document.type`:`source-hub`.

## `acp.document.sourceHub.address`

The SourceHub address of the actor that client-side actions should permit to make SourceHub actions on their behalf. This is a client-side only config param. It is required if the client wishes to make SourceHub ACP requests in order to create protected data.
