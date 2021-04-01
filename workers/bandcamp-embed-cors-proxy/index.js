addEventListener("fetch", (event) => {
  event.respondWith(handleRequest(event));
});

async function handleRequest(event) {
  try {
    const url = new URL(event.request.url);
    const album = url.searchParams.get("album");
    const clientIP = event.request.headers.get("CF-Connecting-IP");
    const origin = event.request.headers.get("Origin");
    const referer = event.request.headers.get("Referer");
    if (album === null) {
      throw new Error("No album");
    }
    if (clientIP === null) {
      throw new Error("No client IP");
    }
    // Don't reply to cross-site requests
    if (origin !== null && new URL(origin).hostname !== "localhost") {
      throw new Error("Bad origin");
    }
    if (referer === null) {
      throw new Error("No referer");
    }
    const request = new Request(
      `https://bandcamp.com/EmbeddedPlayer/ref=${encodeURIComponent(
        referer
      )}/album=${album}`,
      event.request
    );
    request.headers.set("X-Forwarded-For", clientIP);
    request.headers.set("Forwarded", `for=${clientIP}`);
    let body = await fetch(request)
      .then((r) => {
        if (r.status !== 200) {
          throw new Error(`Received status ${r.status} from Bandcamp`);
        }
        return r.text();
      })
      .then((text) => {
        return JSON.parse(
          text.match(/data-player-data="([^"]*)"/)[1].replace(/&quot;/g, '"')
        );
      });

    const response = new Response(JSON.stringify(body), {
      status: 200,
      headers: { "Access-Control-Allow-Origin": origin },
    });
    return response;
  } catch (error) {
    return new Response(error, {
      status: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
    });
  }
}
