import { env, tracing } from "cloudflare:workers";

export type Transaction = {
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

export async function getTransaction(id: string): Promise<Transaction> {
  return tracing.enterSpan("getTransaction()", async (span) => {
    span.setAttribute("up.transaction.id", id);
    const response: any = await fetch(
      `https://api.up.com.au/api/v1/transactions/${id}`,
      {
        headers: {
          Authorization: `Bearer ${await env.UP_ACCESS_TOKEN.get()}`,
        },
      },
    ).then((response) => response.json());

    return response.data;
  });
}

export async function getVerifiedRequestBody(
  body: string,
  signature: string | null,
): Promise<any> {
  return tracing.startActiveSpan("getVerifiedRequestBody()", async (span) => {
    if (signature === null) {
      throw Error("No signature");
    }

    // TODO: Look at Zod/Joi for stricter validation
    const payload = JSON.parse(body);

    const webhookId = payload.data.relationships.webhook.data.id;
    span.setAttribute("up.webhook.id", webhookId);
    const signingSecret = await env.WEBHOOK_SIGNING_KEYS.get(webhookId);

    if (signingSecret === null) {
      throw Error(`No signing secret for webhook ${webhookId}`);
    }

    // The request signature is a 256 bits, but represented in base 16
    const signatureBuffer = new Uint8Array(32);
    for (let i = 0; i < 32; i++) {
      signatureBuffer[i] = Number.parseInt(
        `0x${signature.substring(2 * i, 2 * i + 2)}`,
      );
    }

    const isValidSignature = await crypto.subtle.verify(
      { name: "HMAC", hash: "SHA-256" },
      await crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(signingSecret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["verify"],
      ),
      signatureBuffer,
      new TextEncoder().encode(body),
    );

    if (!isValidSignature) {
      throw Error("Invalid signature");
    }

    return payload;
  });
}

export async function listTransactionsByDate(
  date: Date,
): Promise<Transaction[]> {
  const tomorrow = new Date(date);
  tomorrow.setDate(date.getDate() + 1);

  console.log(
    `Listing transactions from ${date.toISOString()} to ${tomorrow.toISOString()}`,
  );
  const response: any = await fetch(
    `https://api.up.com.au/api/v1/transactions?page[size]=100&filter[since]=${date.toISOString()}&filter[until]=${tomorrow.toISOString()}`,
    {
      headers: {
        Authorization: `Bearer ${await env.UP_ACCESS_TOKEN.get()}`,
      },
    },
  ).then((response) => response.json());
  return response.data;
}
