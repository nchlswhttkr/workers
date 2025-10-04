import { env } from "cloudflare:workers";
import { trace } from "@opentelemetry/api";

export async function getTransaction(id: string): Promise<Transaction> {
  const tracer = trace.getTracer("Up");
  return tracer.startActiveSpan("getTransaction()", async (span) => {
    try {
      span.setAttribute("up.transaction.id", id);
      const response: any = await fetch(
        `https://api.up.com.au/api/v1/transactions/${id}`,
        {
          headers: {
            Authorization: `Bearer ${env.UP_ACCESS_TOKEN}`,
          },
        },
      ).then((response) => response.json());

      return response.data;
    } finally {
      span.end();
    }
  });
}

export async function verifyWebhookRequestSignature(
  body: string,
  signature: string | null,
): Promise<void> {
  const tracer = trace.getTracer("Up");
  tracer.startActiveSpan("verifyWebhookRequestSignature()", async (span) => {
    try {
      if (signature === null) {
        throw Error("No signature");
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
          new TextEncoder().encode(env.UP_WEBHOOK_SECRET_KEY),
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
    } finally {
      span.end();
    }
  });
}

export async function listTransactionsByDate(
  date: Date,
): Promise<Transaction[]> {
  const tracer = trace.getTracer("Up");
  return tracer.startActiveSpan("listTransactionsByDate()", async (span) => {
    try {
      const tomorrow = new Date(date);
      tomorrow.setDate(date.getDate() + 1);

      console.log(
        `Listing transactions from ${date.toISOString()} to ${tomorrow.toISOString()}`,
      );
      const response: any = await fetch(
        `https://api.up.com.au/api/v1/transactions?page[size]=100&filter[since]=${date.toISOString()}&filter[until]=${tomorrow.toISOString()}`,
        {
          headers: {
            Authorization: `Bearer ${env.UP_ACCESS_TOKEN}`,
          },
        },
      ).then((response) => response.json());
      return response.data;
    } finally {
      span.end();
    }
  });
}
