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
    if (origin === null) {
      throw new Error("No origin");
    } else if (
      ![url.hostname, "localhost"].includes(new URL(origin).hostname)
    ) {
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
    let response = await fetch(request);
    response = new Response(response.body, response);
    response.headers.append("Access-Control-Allow-Origin", origin);
    return response;
  } catch (error) {
    return new Response(error, {
      status: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
    });
  }
}
