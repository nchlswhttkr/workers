addEventListener("fetch", (event) => {
  event.passThroughOnException();
  event.respondWith(handleRequest(event));
});

async function handleRequest(event) {
  // Grab alphanumeric chars after /goto/... and lower case to get key
  const url = new URL(event.request.url);
  const path = url.pathname.slice(6);
  const key = decodeURIComponent(path)
    .replace(/[^A-Za-z0-9]/, "")
    .toLowerCase();

  if (key === "") {
    // Empty key goes to site root
    return new Response("", { status: 302, headers: { Location: url.origin } });
  }
  const redirect = await SHORTCUTS.get(key);
  if (redirect) {
    return new Response("", { status: 302, headers: { Location: redirect } });
  }
  // Unknown keys get passed off to origin to deal with
  return fetch(event.request);
}
