import { Transaction } from "./up";

declare const STORE: KVNamespace;

export async function upsertTransaction(transaction: Transaction) {
  await STORE.put(
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
    }
  );
}

export async function listTransactions(): Promise<any> {
  const { keys } = await STORE.list<any>({ prefix: "transactions/" });
  // TODO: Add a check for list_complete
  return keys.sort((a, b) => {
    return Date.parse(b.metadata.createdAt) - Date.parse(a.metadata.createdAt);
  });
}
