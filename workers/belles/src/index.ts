import * as up from "./up";
import * as kv from "./kv";
import { tracing } from "cloudflare:workers";

export default {
  async fetch(request) {
    try {
      const method = request.method;
      const path = new URL(request.url).pathname;

      if (method === "GET" && path === "/api/transactions") {
        return await listTransactions(request);
      } else if (method === "POST" && path === "/api/webhook") {
        return await receiveWebhook(request);
      } else if (method === "POST" && path === "/api/retry") {
        return await retryTransaction(request);
      } else {
        return new Response("Not Found", { status: 404 });
      }
    } catch (error) {
      console.error(error);
      return new Response("Internal Server Error", { status: 500 });
    }
  },
} satisfies ExportedHandler;

async function listTransactions(request: Request): Promise<Response> {
  return new Response(JSON.stringify(await kv.listTransactions()), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

async function receiveWebhook(request: Request): Promise<Response> {
  return tracing.enterSpan("receiveWebhook()", async (span) => {
    const body = await request.text();

    const signature = request.headers.get("X-Up-Authenticity-Signature");

    const payload = await up.getVerifiedRequestBody(body, signature);

    span.setAttribute("up.event.id", payload.data.id);
    span.setAttribute("up.event.type", payload.data.attributes.eventType);
    switch (payload.data.attributes.eventType) {
      case "TRANSACTION_CREATED":
      case "TRANSACTION_SETTLED": {
        const transaction = await up.getTransaction(
          payload.data.relationships.transaction.data.id,
        );
        const {
          description,
          amount: { valueInBaseUnits },
        } = transaction.attributes;

        // Money has to be going _out_ to Belles, no reimbursements
        if (description.includes("Belles") && valueInBaseUnits < 0) {
          await kv.upsertTransaction(transaction);
        }

        // falls through
      }
      default:
        return new Response(JSON.stringify({}), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
    }
  });
}

async function retryTransaction(request: Request): Promise<Response> {
  const date = new Date(new URL(request.url).searchParams.get("date")!);

  const transactions = await up.listTransactionsByDate(date);
  let transactionsMatched = 0;

  for (const transaction of transactions) {
    const {
      description,
      amount: { valueInBaseUnits },
    } = transaction.attributes;

    // Money has to be going _out_ to Belles, no reimbursements
    if (description.includes("Belles") && valueInBaseUnits < 0) {
      await kv.upsertTransaction(transaction);
      transactionsMatched += 1;
    }
  }

  return new Response(
    JSON.stringify({
      transactionsMatched,
      transactionsReviewed: transactions.length,
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    },
  );
}
