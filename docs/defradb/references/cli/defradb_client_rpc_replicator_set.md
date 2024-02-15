# client rpc replicator set

Set a P2P replicator

## Synopsis

Use this command if you wish to add a new target replicator
for the p2p data sync system or add schemas to an existing one

```
defradb client rpc replicator set [-f, --full | -c, --collection] <peer> [flags]
```

## Options

```
  -c, --collection stringArray   Define the collection for the replicator
  -f, --full                     Set the replicator to act on all collections
  -h, --help                     help for set
```

## Options inherited from parent commands

```
      --addr string          gRPC endpoint address (default "0.0.0.0:9161")
      --logformat string     Log format to use. Options are csv, json (default "csv")
      --logger stringArray   Override logger parameters. Usage: --logger <name>,level=<level>,output=<output>,...
      --loglevel string      Log level to use. Options are debug, info, error, fatal (default "info")
      --lognocolor           Disable colored log output
      --logoutput string     Log output path (default "stderr")
      --logtrace             Include stacktrace in error and fatal logs
      --rootdir string       Directory for data and configuration to use (default "$HOME/.defradb")
      --url string           URL of HTTP endpoint to listen on or connect to (default "localhost:9181")
```

## SEE ALSO

* [defradb client rpc replicator](defradb_client_rpc_replicator.md)	 - Interact with the replicator system

