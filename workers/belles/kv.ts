import { trace } from "@opentelemetry/api";
import { env } from "cloudflare:workers";

export async function upsertTransaction(transaction: Transaction) {
  const tracer = trace.getTracer("Transactions KV");
  return tracer.startActiveSpan("upsertTransaction()", async (span) => {
    try {
      await env.TRANSACTIONS.put(
        `transactions/${transaction.id}`,
        JSON.stringify(transaction),
        {
          metadata: {
            createdAt: transaction.attributes.createdAt,
            description: transaction.attributes.description,
            status: transaction.attributes.status,
            value: -transaction.attributes.amount.valueInBaseUnits,
            raw: transaction.attributes.rawText,
          },
        },
      );
    } finally {
      span.end();
    }
  });
}

export async function listTransactions(): Promise<any> {
  const tracer = trace.getTracer("Transactions KV");
  return tracer.startActiveSpan("listTransactions()", async (span) => {
    try {
      const { keys } = await env.TRANSACTIONS.list<any>({
        prefix: "transactions/",
      });
      // TODO: Add a check for list_complete
      return keys.sort((a, b) => {
        return (
          Date.parse(b.metadata.createdAt) - Date.parse(a.metadata.createdAt)
        );
      });
    } finally {
      span.end();
    }
  });
}
