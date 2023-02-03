import * as up from "./up";
import * as kv from "./kv";

addEventListener("fetch", (event) => {
  event.respondWith(handleRequest(event));
});

async function handleRequest(event: FetchEvent): Promise<Response> {
  try {
    const method = event.request.method.toLocaleLowerCase();
    const path = new URL(event.request.url).pathname;
    if (method === "get" && path === "/api/transactions") {
      return await listTransactions();
    } else if (method === "post" && path === "/api/webhook") {
      return await receiveWebhook(event);
    } else {
      return new Response("Not Found", { status: 404 });
    }
  } catch (error) {
    console.error(error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

async function listTransactions(): Promise<Response> {
  return new Response(JSON.stringify(await kv.listTransactions()), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

async function receiveWebhook(event: FetchEvent): Promise<Response> {
  const body = await event.request.text();
  const signature = event.request.headers.get("X-Up-Authenticity-Signature");
  await up.verifyWebhookRequestSignature(body, signature);

  const payload = JSON.parse(body);
  switch (payload.data.attributes.eventType) {
    case "TRANSACTION_CREATED":
    case "TRANSACTION_SETTLED": {
      const transaction = await up.getTransaction(
        payload.data.relationships.transaction.data.id
      );
      if (transaction.attributes.description === "Belles Hot Chicken") {
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
}
