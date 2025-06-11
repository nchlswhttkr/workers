import { AsyncLocalStorage } from "node:async_hooks";
import { ExportedHandler } from "@cloudflare/workers-types/latest";
import { name, version } from "./package.json";
import {
  context,
  ContextManager,
  Context,
  ROOT_CONTEXT,
  trace,
} from "@opentelemetry/api";
import {
  BasicTracerProvider,
  SimpleSpanProcessor,
} from "@opentelemetry/sdk-trace-base";
import { resourceFromAttributes } from "@opentelemetry/resources";
import { ATTR_SERVICE_NAME } from "@opentelemetry/semantic-conventions";
import { SpanExporterFetch } from "@nchlswhttkr/otlp-exporter-fetch";

class AsyncLocalStorageContextManager implements ContextManager {
  private contextStorage: AsyncLocalStorage<Context>;

  constructor() {
    this.contextStorage = new AsyncLocalStorage();
  }

  active(): Context {
    return this.contextStorage.getStore() || ROOT_CONTEXT;
  }

  // Stub out this method until I see it in action
  bind(...args): any {
    throw new Error("AsyncLocalStorageContextManager.bind() not implemented");
  }

  disable(): this {
    this.contextStorage.disable();
    return this;
  }

  enable() {
    return this;
  }

  // Would rather not delve into return types, so keeping this light for now
  // https://open-telemetry.github.io/opentelemetry-js/interfaces/_opentelemetry_api._opentelemetry_api.ContextManager.html#with
  with(context, fn, thisArg, ...args) {
    if (thisArg !== undefined) {
      fn = fn.bind(thisArg);
    }

    return this.contextStorage.run(context, fn, ...args) as any;
  }
}

// https://github.com/open-telemetry/opentelemetry-js-api/blob/main/docs/context.md#context-manager
const contextManager = new AsyncLocalStorageContextManager();
contextManager.enable();
context.setGlobalContextManager(contextManager);

export function withTracing(
  workerName: string,
  worker: ExportedHandler
): ExportedHandler {
  const fetch = async (event, env, ctx) => {
    const url = await env.OTEL_EXPORTER_OTLP_ENDPOINT.get();
    const headers = {};
    for (const header of await env.OTEL_EXPORTER_OTLP_HEADERS.get().then(
      (secret) => secret.split(",")
    )) {
      const [key, value] = header.split("=");
      headers[key] = value;
    }

    const exporter = new SpanExporterFetch({ url, headers });
    const processor = new SimpleSpanProcessor(exporter);

    const resource = resourceFromAttributes({
      [ATTR_SERVICE_NAME]: workerName,
      "cf.worker.version.id": env.CF_VERSION_METADATA.id,
      "cf.worker.version.tag": env.CF_VERSION_METADATA.tag,
      "cf.worker.version.timestamp": env.CF_VERSION_METADATA.timestamp,
      "telemetry.sdk.name": name,
      "telemetry.sdk.language": "js",
      "telemetry.sdk.version": version,
    });

    const provider = new BasicTracerProvider({
      resource,
      spanProcessors: [processor],
    });

    // TODO: Investigate circumstances under which a provider might not register
    trace.setGlobalTracerProvider(provider);

    try {
      return await worker.fetch(event, env, ctx);
    } finally {
      ctx.waitUntil(provider.forceFlush());
    }
  };
  return { fetch };
}
