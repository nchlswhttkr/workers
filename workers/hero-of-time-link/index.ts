import { withTelemetry } from "@nchlswhttkr/cloudflare-workers-otel";

export default withTelemetry("hero-of-time-link", {
  async fetch(request, env) {
    // Grab alphanumeric chars after /goto/... and lower case to get key
    const url = new URL(request.url);
    const path = url.pathname.slice(6);
    const key = decodeURIComponent(path)
      .replace(/[^A-Za-z0-9]/, "")
      .toLowerCase();

    const redirect = await env.SHORTCUTS.get(key);
    if (redirect) {
      return new Response("", { status: 302, headers: { Location: redirect } });
    }
    // Unknown keys get passed off to origin to deal with
    return fetch(request);
  },
} satisfies ExportedHandler<Cloudflare.Env>);
