---
title: Deployment & Configuration
---

:::tip
For the full list of configuration settings, see [References -> Configuration](/references/config.md).
:::

## Configuration

DefraDB's root directory is located at `~/.defradb/` on UNIX, and at `%USERPROFILE%\.defradb`​ on Windows. Among other things, it contains the data, keys, and the [configuration file](/references/config.md). To specify a different path for the root directory, use the CLI option `--rootdir` when starting the instance.

## Set up Access Control Policies (ACP)

To restrict what different users are allowed to do, set up suitable [access control policies](/references/acp.md).

## Ports

DefraDB uses two ports:

1. **API Port** (default `9181`): HTTP API. Customizable via the CLI option `--url` when starting the instance.
2. **P2P Port** (default `9171`): P2P features. Customizable via the CLI option `--p2paddr` when starting the instance.

```shell title="Start DefraDB listening on ports 9172 and 9182"
defradb start --url localhost:9182 --p2paddr /ip4/127.0.0.1/tcp/9172
```

### External port binding

By default, the HTTP API and P2P network use localhost. If you want to expose the ports externally, you need to specify the addresses in the config or command line parameters:

```shell
defradb start --p2paddr /ip4/0.0.0.0/tcp/9171 --url 0.0.0.0:9181
```

## Secure the HTTP API with TLS

The HTTP API is exposed unencrypted by default, but you can configure it to use TLS.

Although keys can be located in any directory, the default location is `~/.defradb/certs`. To enable TLS, start the instance providing the paths to the public (`pubkeypath`) and private (`privkeypath`) keys:

```shell
defradb start --pubkeypath ~/.defradb/certs/pubkey.crt --privkeypath ~/.defradb/certs/privkey.key
```

:::tip generate a self-signed certificate
```shell 
openssl ecparam -genkey -name secp384r1 -out ~/.defradb/certs/privkey.key
openssl req -new -x509 -sha256 -key ~/.defradb/certs/privkey.key -out ~/.defradb/certs/pubkey.crt -days 365
```
:::

## Set up peer-to-peer synchronization

By default, DefraDB starts with its P2P features active (see [Synchronize documents across multiple nodes](./p2p/)). To disable P2P on an instance, start it with the `--no-p2p` flag.

```bash
defradb start --no-p2p
```

## Support Cross-Origin Resource Sharing (CORS)

Because DefraDB doesn't have any allowed origins set by default, you may face a Cross-Origin Resource Sharing (CORS) error when accessing DefraDB through a frontend interface. To specify which origins should be allowed to access the DefraDB endpoint, specify them when starting the database:

```shell
defradb start --allowed-origins=https://yourdomain.com
```

If running a frontend app locally on localhost, allowed origins must include the application's port:

```shell
defradb start --allowed-origins=http://localhost:3000
```

:::tip
The catch-all `*` is also a valid origin.
:::

## Telemetry

DefraDB has no telemetry reporting by default. To enable OpenTelemetry in DefraDB you must [build](/setup/install/#build) with the `telemetry` tag set. To configure the HTTP exporters use the environment variables described in the
[metric exporter documentation](https://pkg.go.dev/go.opentelemetry.io/otel/exporters/otlp/otlpmetric/otlpmetrichttp) and [trace exporter documentation](https://pkg.go.dev/go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracehttp).
