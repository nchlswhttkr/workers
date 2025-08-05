declare namespace Cloudflare {
  interface Env {
    TRANSACTIONS: KVNamespace;
    OTEL_EXPORTER_OTLP_ENDPOINT: SecretsStoreSecret;
    OTEL_EXPORTER_OTLP_HEADERS: SecretsStoreSecret;
    CF_VERSION_METADATA: WorkerVersionMetadata;

    UP_ACCESS_TOKEN: string;
    UP_WEBHOOK_SECRET_KEY: string;
  }
}

type Transaction = {
  id: string;
  attributes: {
    status: string;
    rawText: string;
    description: string;
    amount: {
      valueInBaseUnits: number;
    };
    createdAt: string;
  };
};
