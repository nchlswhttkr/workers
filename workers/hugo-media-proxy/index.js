// TODO: Might be good to do some origin checking?

addEventListener("fetch", (event) => {
  event.respondWith(handleRequest(event));
});

async function handleRequest(event) {
  try {
    // First try to get from cache
    let response = await caches.default.match(event.request);
    if (response) {
      return response;
    }

    // Otherwise fetch the media in question
    const url = new URL(event.request.url).searchParams.get("url");
    if (url === null) {
      throw new Error("Expected URL");
    }

    // Retrieve media if it exists
    let {
      value: media,
      metadata: { mimeType },
    } = await CACHED_MEDIA.getWithMetadata(url, {
      type: "arrayBuffer",
      cacheTtl: 24 * 60 * 60,
    });
    if (!media) {
      return new Response("", { status: 404 });
    }

    response = new Response(media, {
      status: 200,
      headers: {
        "Accept-Ranges": "bytes",
        "Content-Length": media.length,
        "Content-Type": mimeType,
        "X-Robots-Tag": "noindex",
      },
    });
    event.waitUntil(caches.default.put(event.request, response.clone()));
    return response;
  } catch (error) {
    return new Response(error, { status: 500 });
  }
}
