## Backup and restore {/* #backup-and-restore */}

It is currently not possible to do a full backup of DefraDB that includes the history of changes through the Merkle DAG. However, DefraDB supports a simple backup of the data state in JSON format that can be used to seed a database or help with transitioning from one DefraDB version to another.

To backup the data, run the following command:

```shell
defradb client backup export path/to/backup.json
```

To pretty print the JSON content when exporting, run the following command:

```shell
defradb client backup export --pretty path/to/backup.json
```

To restore the data, run the following command:

```shell
defradb client backup import path/to/backup.json
```
