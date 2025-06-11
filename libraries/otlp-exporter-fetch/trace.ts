import { IOtlpExportDelegate } from "./node_modules/@opentelemetry/otlp-exporter-base/build/src/otlp-export-delegate";
import { ReadableSpan, SpanExporter } from "@opentelemetry/sdk-trace-base";
import {
  OTLPExporterBase,
  OTLPExporterConfigBase,
} from "@opentelemetry/otlp-exporter-base";
import { ExportResult, ExportResultCode } from "@opentelemetry/core";
import { JsonTraceSerializer } from "@opentelemetry/otlp-transformer";
import { name, version } from "./package.json";

// https://opentelemetry.io/docs/specs/otel/trace/sdk/#span-exporter
export class FetchExportDelegate
  implements IOtlpExportDelegate<ReadableSpan[]>
{
  private spans: ReadableSpan[] = [];
  private config: OTLPExporterConfigBase;

  constructor(config: OTLPExporterConfigBase) {
    this.config = config;
  }

  async export(
    spans: ReadableSpan[],
    callback: (result: ExportResult) => void
  ) {
    // Batch up and rely on forceFlush()
    this.spans = this.spans.concat(spans);
    callback({ code: ExportResultCode.SUCCESS });
  }

  async forceFlush(): Promise<void> {
    const response = await fetch(`${this.config.url}/v1/traces`, {
      method: "POST",
      headers: Object.assign(
        {
          "User-Agent": `${name} v${version}`,
          "Content-Type": "application/json",
        },
        this.config.headers
      ),
      body: JsonTraceSerializer.serializeRequest(this.spans),
    });
    console.log(response.status);
    console.log([...response.headers.entries()]);
    console.log(await response.json());
  }

  async shutdown(): Promise<void> {}
}

export class SpanExporterFetch
  extends OTLPExporterBase<ReadableSpan[]>
  implements SpanExporter
{
  constructor(config?: OTLPExporterConfigBase) {
    super(new FetchExportDelegate(config));
  }
}
