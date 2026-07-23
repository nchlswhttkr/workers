import { env } from "cloudflare:workers";
import { randomInt } from "node:crypto";

export default {
  async fetch(request, env): Promise<Response> {
    const url = new URL(request.url);
    let object: R2ObjectBody | null;
    const headers = new Headers();
    let status = 200;

    // https://xclacksoverhead.org/home/about
    headers.set("X-Clacks-Overhead", "GNU Terry Pratchett");

    // Only GET requests allowed
    if (request.method !== "GET" && request.method !== "HEAD") {
      status = 501;
      return new Response(null, { status, headers });
    }

    // https://nicholas.cloud/blog/no-floc-for-me-please-google/
    headers.set("Permissions-Policy", "interest-cohort=()");

    // Blanket caching policy of 1 hour
    headers.set("Cache-Control", "public, s-maxage=3600");

    // Redirect blips to blog
    if (url.pathname.startsWith("/blips/")) {
      headers.set("Location", url.pathname.replace("/blips/", "/blog/"));
      status = 301;
      return new Response(null, { status, headers });
    }

    if (url.pathname === "/niko.png") {
      const nikos = await env.NIKO.list();
      const index = randomInt(nikos.objects.length);

      // Don't cache Niko avatars
      headers.set("Cache-Control", "no-store");
      object = await env.NIKO.get(nikos.objects[index].key);
    } else if (url.pathname.startsWith("/files/")) {
      object = await env.FILES.get(url.pathname.replace("/files/", ""));
    } else {
      object = await getStaticPage(url);
    }

    if (!object) {
      object = await env.BLOG.get("404.html");
      status = 404;
    }

    if (!object) {
      throw new Error("No object or 404 page found");
    }

    object.writeHttpMetadata(headers);
    headers.set("etag", object.httpEtag);

    // Serve blogroll OPML as XML to force in-browser viewing
    if (url.pathname === "/blogroll.opml") {
      headers.set("content-type", "application/xml");
    }

    return new Response(object.body, { status, headers });
  },
} satisfies ExportedHandler<Env>;

async function getStaticPage(url: URL): Promise<R2ObjectBody | null> {
  const key = url.pathname.substring(1); // trim leading slash

  const common_rss_feed_paths = ["rss", "rss/", "feed"];
  if (common_rss_feed_paths.includes(key)) {
    return env.BLOG.get("index.xml");
  }

  if (key.length === 0 || key.endsWith("/")) {
    return env.BLOG.get(key + "index.html");
  }

  return env.BLOG.get(key);
}
