addEventListener("fetch", event => {
  event.respondWith(handleRequest(event.request));
});

let counter = 0;

/**
 * Respond to the request
 * @param {Request} request
 */
async function handleRequest(request) {
  return new Response(`<h1>${++counter} request/s made!</h1>`, {
    status: 200,
    headers: {
      "Content-Type": "text/html"
    }
  });
}
