import shortcuts from "./shortcuts.json";

addEventListener("fetch", (event) => {
  event.passThroughOnException();
  event.respondWith(handleRequest(event));
});

async function handleRequest(event) {
  // Grab the contents after https://nicholas.cloud/goto... and ensure it is
  // alphanumeric, removing any garbage if necessary
  const path = new URL(event.request.url).pathname.slice(6);
  const key = decodeURIComponent(path).replace(/[^A-Za-z0-9]/, "");
  const redirect = shortcuts[key];
  if (redirect) {
    return new Response("", { status: 302, headers: { Location: redirect } });
  }

  // Otherwise, fall back to main site
  return fetch(event);
}
