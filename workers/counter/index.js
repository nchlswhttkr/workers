addEventListener("fetch", event => {
  event.respondWith(handleRequest(event.request));
});

let counter = 0;

/**
 * Respond to the request
 * @param {Request} request
 */
async function handleRequest(request) {
  counter++;
  return new Response(counter.toString(), { status: 200 });
}
