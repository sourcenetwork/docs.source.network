# server-dump

Dumps the state of the entire database

```
defradb server-dump [flags]
```

## Options

```
  -h, --help           help for server-dump
      --store string   Datastore to use. Options are badger, memory (default "badger")
```

## Options inherited from parent commands

```
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

* [defradb](defradb.md)	 - DefraDB Edge Database

