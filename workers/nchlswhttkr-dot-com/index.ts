import { withTracing } from "@nchlswhttkr/cloudflare-workers-otel-trace";
import { trace } from "@opentelemetry/api";
import { name, version } from "./package.json";

export default withTracing("nchlswhttkr-dot-com", {
  async fetch(request) {
    const tracer = trace.getTracer(name, version);
    return tracer.startActiveSpan("fetch()", (span) => {
      try {
        span.setAttribute("http.request.method", request.method);
        span.setAttribute("url.full", request.url);
        span.setAttribute(
          "user_agent.original",
          request.headers.get("user-agent")
        );
        const url = new URL(request.url);
        switch (url.hostname) {
          case "blog.nchlswhttkr.com":
            return redirect(`https://nicholas.cloud/blog${url.pathname}`);
          case "resume.nchlswhttkr.com":
            return redirect(`https://nicholas.cloud/resume`);
          case "source.nchlswhttkr.com":
            return redirect("https://github.com/nchlswhttkr/website/");
          case "barhack.nchlswhttkr.com":
            return redirect("https://github.com/nchlswhttkr/barhack/");
          case "www.nchlswhttkr.com":
            return redirect(`https://nicholas.cloud${url.pathname}`);
          case "dalordish.nchlswhttkr.com":
            return redirect("https://www.youtube.com/watch?v=ktxtvMqmqu8");
          default:
            return redirect(`https://nicholas.cloud${url.pathname}`);
        }
      } catch (error) {
        span.recordException(error);
        return new Response("", { status: 500 });
      } finally {
        span.end();
      }
    });
  },
} satisfies ExportedHandler);

function redirect(destination) {
  return new Response("", {
    status: 301,
    headers: { Location: destination },
  });
}
