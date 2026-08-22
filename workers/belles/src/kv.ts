import { env } from "cloudflare:workers";
import { Transaction } from "./up";

export async function upsertTransaction(transaction: Transaction) {
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
}

export async function deleteTransaction(key: string) {
  await env.TRANSACTIONS.delete(key);
}

export async function listTransactions(): Promise<any> {
  const { keys } = await env.TRANSACTIONS.list<any>({
    prefix: "transactions/",
  });
  // TODO: Add a check for list_complete
  return keys.sort((a, b) => {
    return Date.parse(b.metadata.createdAt) - Date.parse(a.metadata.createdAt);
  });
}
