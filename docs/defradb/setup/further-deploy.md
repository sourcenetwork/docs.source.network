---
title: Advanced deployment information
---

## Configuration

DefraDB's root directory is located at `~/.defradb/`. Among other things, it contains the data, keys, and the [configuration file](/references/config.md).

## Set up Access Control Policies (ACP)

To restrict what different players are allowed to do, set up suitable [access control policies](/references/acp.md).

## Secure the HTTP API with TLS

The HTTP API is exposed unencrypted by default, but you can configure it to use TLS.

Although keys can be located in any directory, the default location is `~/.defradb/certs`. To enable TLS, start the instance providing the paths to the public (`pubkeypath`) and private (`privkeypath`) keys:

```shell
defradb start --pubkeypath ~/.defradb/certs/pubkey.crt --privkeypath ~/.defradb/certs/privkey.key
```

:::tip generate a *self-signed* certificate
```shell 
openssl ecparam -genkey -name secp384r1 -out ~/.defradb/certs/privkey.key
openssl req -new -x509 -sha256 -key ~/.defradb/certs/privkey.key -out ~/.defradb/certs/pubkey.crt -days 365
```
:::


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

## External port binding

By default, the HTTP API and P2P network use localhost. If you want to expose the ports externally, you need to specify the addresses in the config or command line parameters:

```shell
defradb start --p2paddr /ip4/0.0.0.0/tcp/9171 --url 0.0.0.0:9181
```

## Telemetry

DefraDB has no telemetry reporting by default. To enable OpenTelemetry in DefraDB you must [build](/setup/install/#build) with the `telemetry` tag set. To configure the HTTP exporters use the environment variables described in the
[metric exporter documentation](https://pkg.go.dev/go.opentelemetry.io/otel/exporters/otlp/otlpmetric/otlpmetrichttp) and [trace exporter documentation](https://pkg.go.dev/go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracehttp).
