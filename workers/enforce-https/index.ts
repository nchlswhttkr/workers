import { withTelemetry } from "@nchlswhttkr/cloudflare-workers-otel";

export default withTelemetry("enforce-https", {
  async fetch(request: Request) {
    return new Response("", {
      status: 301,
      headers: { Location: request.url.replace("http", "https") },
    });
  },
});
