---
title: Install
---

## Get DefraDB {/* #get-defradb */}

There's a few different options to obtain an executable of DefraDB.

### Download a pre-compiled binary {/* #download-a-pre-compiled-binary */}

[Download the executable](https://github.com/sourcenetwork/defradb/releases) appropriate to your system.

To be able to run `defradb` commands, the binary must be located in a directory included in your `PATH`. On UNIX systems, a common choice is to place `defradb` in `/usr/local/bin`.

### Build locally {/* #build-locally */}

Building DefraDB locally requires [Go](https://golang.org/) >= 1.24 and Git.

```shell
git clone https://github.com/sourcenetwork/defradb.git
cd defradb
make install
```

This will produce a `defradb` binary in your [Go workspace](https://go.dev/wiki/SettingGOPATH). To be able to run `defradb` commands, ensure `$GOPATH/bin` is included in your `PATH`:

```shell
export PATH=$PATH:$(go env GOPATH)/bin
```

:::tip

The Go compiler requires substantial memory during compilation. Builds with less than 2 GB of available RAM will likely fail with out-of-memory errors.

<details>
<summary>Tips for building on resource-constrained systems</summary>

- For out-of-memory errors, use `-p 1` to limit compiler parallelism:

  ```
  go build -p 1 ./cmd/defradb
  ```
- If `/tmp` is located on a small filesystem, redirect Go's temp directories to locations with more space:

  ```
  export GOTMPDIR=/path/with/space
  export GOCACHE=/path/with/space/go-cache
  export GOMODCACHE=/path/with/space/go-mod
  ```
- For extremely constrained environments, you can reduce memory usage by disabling optimizations (produces slower binary):

  ```
  go build -p 1 -gcflags="all=-N -l" ./cmd/defradb
  ```

</details>

:::

### Docker container {/* #docker-container */}

You can also run DefraDB in a Docker container. Official images are hosted on [GitHub](ghcr.io/sourcenetwork/defradb).

```shell
docker run \
  -e DEFRA_KEYRING_SECRET=secret \
  -p 9181:9181 \
  -p 9171:9171 \
  -name defradb \
  ghcr.io/sourcenetwork/defradb:latest \
  start
```

The environment variable `DEFRA_KEYRING_SECRET` is used to initialize [DefraDB's keys](keys.md), so set it to a value that you will later have access to.


## Start DefraDB {/* #start-defradb */}

The database provisions necessary keys when starting it for the first time, storing them securely in the `defradb` keyring.
The secret to generate keys and unlock the keyring is provided via the `DEFRA_KEYRING_SECRET` environment variable. The variable can also be defined in a `.env` file located in the working directory, or at a filepath defined by the `--secret-file` flag.

```shell title="Generate and store secret into .env file"
echo "DEFRA_KEYRING_SECRET=$(openssl rand -base64 32)" > .env
```

```shell title="Start the node"
defradb start
```

:::tip
The keyring secret unlocks the identity and encryption keys for the local node, so you will need to provide it every time you start the node. For more information on keys, and on how to provide your own keys, see [Keys setup](./keys.md).
:::

## Verify connection

To verify the local connection to the node, ping the `/health-check` HTTP endpoint:

```shell
wget -qO- http://localhost:9181/health-check
```

An online node responds with `"Healthy"`.
