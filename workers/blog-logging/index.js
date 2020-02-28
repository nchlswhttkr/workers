addEventListener("fetch", event => {
  event.passThroughOnException();
  event.respondWith(handleRequest(event));
});

const blogPostPath = /^\/blog\/([a-z0-9-]+)\/(index.html)?$/;

async function handleRequest(event) {
  const matched = new URL(event.request.url).pathname.match(blogPostPath);
  if (matched !== null) {
    event.waitUntil(
      fetch(ENV_LOGGING_URL, {
        method: "POST",
        body: matched[1]
      })
    );
  }

  return fetch(event);
}
