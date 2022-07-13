addEventListener("fetch", (event) => {
  event.respondWith(handleRequest(event));
});

async function handleRequest(event) {
  try {
    return new Response(
      `Hello ${event.request.headers.get("User-Agent") || "world"}`,
      {
        status: 200,
      }
    );
  } catch (error) {
    return new Response(error, { status: 500 });
  }
}
