# cloudflare-workers-otel

Initialises OpenTelemetry providers compatible with Cloudflare Workers. Currently supports the Traces and Logs API.

This library requires several worker bindings, for OTel configuration and worker version metadata. Refer to the sample configuration below.

```
secrets_store_secrets = [
  { store_id= "63609536ac1e446eb59160e3216e5f99", binding = "OTEL_EXPORTER_OTLP_ENDPOINT", secret_name = "OTEL_EXPORTER_OTLP_ENDPOINT" },
  { store_id= "63609536ac1e446eb59160e3216e5f99", binding = "OTEL_EXPORTER_OTLP_HEADERS", secret_name = "OTEL_EXPORTER_OTLP_HEADERS" }
]

[version_metadata]
binding = "CF_VERSION_METADATA"
```

Providers will be automatically registered with the `withTelemetry` wrapper.

```ts
import { withTelemetry } from "@nchlswhttkr/cloudflare-workers-otel";

export default withTelemetry("worker-script-name", {
  async fetch(...args) {
    return new Response("Hello world");
  },
});
```
