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
    const url = new URL(event.request.url);
    const key = url.searchParams.get("url");
    if (key === null) {
      throw new Error("Expected key");
    }
    let media = await CACHED_MEDIA.get(
      url.searchParams.get("url"),
      "arrayBuffer"
    );

    // It's always possible the media in question might not be available
    if (!media) {
      return new Response("", { status: 404 });
    }

    if (url.searchParams.get("base64") === "true") {
      response = new Response(
        JSON.stringify({
          media: btoa(
            Array.from(new Uint8Array(media), (byte) =>
              String.fromCharCode(byte)
            ).join("")
          ),
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    } else {
      response = new Response(media, {
        status: 200,
        headers: {
          "Accept-Ranges": "bytes",
          "Content-Length": media.length,
          "Content-Type": getMime(key),
        },
      });
    }
    event.waitUntil(caches.default.put(event.request, response.clone()));
    return response;
  } catch (error) {
    return new Response(error, { status: 500 });
  }
}

function getMime(key) {
  const extension = key
    .split("?")[0]
    .split(".")
    .reduce((_, value) => value);
  switch (extension) {
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "png":
      return "image/png";
    case "mp4":
      return "video/mp4";
    default:
      throw new Error("Could not determine MIME type");
  }
}
