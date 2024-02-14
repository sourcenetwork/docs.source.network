# client rpc addreplicator

Add a new replicator

## Synopsis

Use this command if you wish to add a new target replicator
for the p2p data sync system.

```
defradb client rpc addreplicator <collection> <peer> [flags]
```

## Options

```
  -h, --help   help for addreplicator
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

* [defradb client rpc](defradb_client_rpc.md)	 - Interact with a DefraDB gRPC server

