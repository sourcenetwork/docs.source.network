---
title: Install
---

# install

DefraDB's root directory is located at `~/.defradb/`. Among other things, it contains the [configuration file](/references/config.md).

## Build

 or building it locally using the [Go toolchain](https://golang.org/):

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

For prototyping, you can also run DefraDB in a Docker container:

```shell
docker run \
  -e DEFRA_KEYRING_SECRET=secret \
  -p 9181:9181 \
  ghcr.io/sourcenetwork/defradb:1.0.0-rc1 \
  start --url 0.0.0.0:9181
```

:::


## Secure the HTTP API with TLS

The HTTP API is exposed unencrypted by default, but you can configure it to use TLS.

Although keys can be located in any directory, the default location is `~/.defradb/certs`. To enable TLS, start the instance providing the paths to the public (`pubkeypath`) and private (`privkeypath`) keys:

```shell
defradb start --pubkeypath ~/.defradb/certs/pubkey.crt --privkeypath ~/.defradb/certs/privkey.key
```

:::tip

To generate a *self-signed* certificate,

```shell
openssl ecparam -genkey -name secp384r1 -out ~/.defradb/certs/privkey.key
openssl req -new -x509 -sha256 -key ~/.defradb/certs/privkey.key -out ~/.defradb/certs/pubkey.crt -days 365
```

:::


## Support CORS

When accessing DefraDB through a frontend interface, you may be confronted with a CORS error. That is because, by default, DefraDB will not have any allowed origins set. To specify which origins should be allowed to access your DefraDB endpoint, specify them when starting the database:

```shell
defradb start --allowed-origins=https://yourdomain.com
```

If running a frontend app locally on localhost, allowed origins must be set with the port of the app:

```shell
defradb start --allowed-origins=http://localhost:3000
```

:::info

The catch-all `*` is also a valid origin.

:::

## External port binding

By default, the HTTP API and P2P network use localhost. If you want to expose the ports externally, you need to specify the addresses in the config or command line parameters:

```shell
defradb start --p2paddr /ip4/0.0.0.0/tcp/9171 --url 0.0.0.0:9181
```
