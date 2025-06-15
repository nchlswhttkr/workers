import { IOtlpExportDelegate } from "./node_modules/@opentelemetry/otlp-exporter-base/build/src/otlp-export-delegate";
import { LogRecordExporter, ReadableLogRecord } from "@opentelemetry/sdk-logs";
import {
  OTLPExporterBase,
  OTLPExporterConfigBase,
} from "@opentelemetry/otlp-exporter-base";
import { ExportResult, ExportResultCode } from "@opentelemetry/core";
import { JsonLogsSerializer } from "@opentelemetry/otlp-transformer";
import { name, version } from "./package.json";

// https://opentelemetry.io/docs/specs/otel/trace/sdk/#span-exporter
export class FetchExportDelegate
  implements IOtlpExportDelegate<ReadableLogRecord[]>
{
  private logs: ReadableLogRecord[] = [];
  private config: OTLPExporterConfigBase;

  constructor(config: OTLPExporterConfigBase) {
    this.config = config;
  }

  export(logs: ReadableLogRecord[], callback: (result: ExportResult) => void) {
    fetch(`${this.config.url}/v1/logs`, {
      method: "POST",
      headers: Object.assign(
        {
          "User-Agent": `${name} v${version}`,
          "Content-Type": "application/json",
        },
        this.config.headers
      ),
      body: JsonLogsSerializer.serializeRequest(logs),
    }).then(async (response) => {
      console.log(response.status);
      console.log([...response.headers.entries()]);
      console.log(await response.json());
      callback({ code: ExportResultCode.SUCCESS });
    });
  }

  async forceFlush(): Promise<void> {
    // TODO: Fix this stub implementation and properly implement an exporter
  }

  async shutdown(): Promise<void> {}
}

export class LogRecordExporterFetch
  extends OTLPExporterBase<ReadableLogRecord[]>
  implements LogRecordExporter
{
  constructor(config?: OTLPExporterConfigBase) {
    super(new FetchExportDelegate(config));
  }
}
