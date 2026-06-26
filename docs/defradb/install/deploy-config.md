---
title: Deployment & Configuration
---

:::tip
For the full list of configuration settings, see [Reference -> Configuration](/references/config.md).
:::

## Root directory {/* #root-dir */}

DefraDB's root directory is located at `~/.defradb/` on UNIX and at `%USERPROFILE%\.defradb`​ on Windows. Among other things, it contains the data, [keys](/install/keys.md), and [configuration file](/references/config.md). To specify a different path for the root directory, use the CLI option `--rootdir` when starting the instance.

## Set up Access Control Policies {/* #acp */}

To restrict what different users are allowed to do, set up appropriate [document access control policies](/security/document-access-control.md).

## Ports {/* #ports */}

DefraDB uses two ports:

1. **HTTP API port** (default `9181`). Customizable via the CLI option `--url` or the config setting [`api.address`](/references/config.md#apiaddress) when starting the instance.
2. **P2P port** (default `9171`). Customizable via the CLI option `--p2paddr` or the config setting [`net.p2paddresses`](/references/config.md#netp2paddresses) when starting the instance.

```shell title="Start DefraDB listening on ports 9172 and 9182"
defradb start --url localhost:9182 --p2paddr /ip4/127.0.0.1/tcp/9172
```

### External port binding {/* #ports-external */}

By default, the HTTP API and P2P network use localhost. To expose the ports externally, specify the addresses in the config or command line parameters:

```shell
defradb start --p2paddr /ip4/0.0.0.0/tcp/9171 --url 0.0.0.0:9181
```

## Secure the HTTP API with TLS {/* #tls */}

The HTTP API is exposed unencrypted by default, but you can configure it to use TLS.

DefraDB will automatically start with TLS if a valid key pair is found at paths `~/.defradb/certs/server.crt` and `~/.defradb/certs/server.key`.
To enable TLS with keys located in custom paths, start the instance providing their paths with the flags `--pubkeypath` and `--privkeypath`:
```shell title="Enable TLS for HTTP API with custom key paths"
defradb start --pubkeypath ~/.defradb/certs/pubkey.crt --privkeypath ~/.defradb/certs/privkey.key
```

:::tip generate a self-signed certificate
```shell
mkdir -p ~/.defradb/certs
openssl ecparam -genkey -name secp384r1 -out ~/.defradb/certs/server.key
openssl req -new -x509 -sha256 -key ~/.defradb/certs/server.key -out ~/.defradb/certs/server.crt -days 365
```
:::

:::warning TLS and CLI commands
The `defradb` CLI commands don't support connection to instances with TLS enabled.
:::

## Set up peer-to-peer synchronization {/* #p2p-setup */}

By default, DefraDB starts with its P2P features active. For information on how to set up P2P, see [Synchronize documents across multiple nodes](/p2p/index.md).

:::note disable p2p
Disable P2P on an instance by starting it with the `--no-p2p` flag.

```bash
defradb start --no-p2p
```
:::

## Support Cross-Origin Resource Sharing (CORS) {/* #cors */}

Because DefraDB doesn't have any allowed origins set by default, you may face a Cross-Origin Resource Sharing (CORS) error when accessing DefraDB through a frontend interface. Specify allowed origins when starting the database:

```shell
defradb start --allowed-origins=https://yourdomain.com
```

For frontend apps running on localhost, allowed origins must include the application's port:

```shell
defradb start --allowed-origins=http://localhost:3000
```

:::tip
The catch-all `*` is also a valid origin.
:::

## Telemetry {/* #telemetry */}

DefraDB has no telemetry reporting by default. To enable OpenTelemetry in DefraDB you must [build the binary](/install/index.md#build) with the `telemetry` tag set. To configure the HTTP exporters, use the environment variables described in the
[metric exporter documentation](https://pkg.go.dev/go.opentelemetry.io/otel/exporters/otlp/otlpmetric/otlpmetrichttp) and [trace exporter documentation](https://pkg.go.dev/go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracehttp).
