addEventListener("fetch", (event) => {
  event.respondWith(handleRequest(event));
});

async function handleRequest(event: FetchEvent) {
  try {
    return new Response("", {
      status: 301,
      headers: { Location: event.request.url.replace("http", "https") },
    });
  } catch (error) {
    return new Response(error, { status: 500 });
  }
}
