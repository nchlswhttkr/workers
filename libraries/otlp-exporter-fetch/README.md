# otlp-exporter-fetch

Implements an OTLP exporter using `fetch()` for environments that do not support `XMLHttpRequest` and `Navigator.sendBeacon()`.

> ![CAUTION]
> The bare minimum has been done to get the span exporter working, do not expect adherance to [the OTel spec](https://opentelemetry.io/docs/specs/otel/trace/sdk/#span-exporter).
