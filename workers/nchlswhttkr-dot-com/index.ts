import { withTelemetry } from "@nchlswhttkr/cloudflare-workers-otel";
import { trace } from "@opentelemetry/api";

export default withTelemetry("nchlswhttkr-dot-com", {
  async fetch(request) {
    const span = trace.getActiveSpan();
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
    }
  },
} satisfies ExportedHandler);

function redirect(destination) {
  return new Response("", {
    status: 301,
    headers: { Location: destination },
  });
}
