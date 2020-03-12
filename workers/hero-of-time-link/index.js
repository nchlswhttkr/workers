addEventListener("fetch", event => {
  event.passThroughOnException();
  event.respondWith(handleRequest(event));
});

let shortcuts; // mutable
const SHORTCUTS_URL = "https://nchlswhttkr.keybase.pub/links.json";

async function handleRequest(event) {
  // Only fetch shortcut file if not already in memory
  if (!shortcuts) {
    shortcuts = await (await fetch(SHORTCUTS_URL)).json();
  }

  // Grab the contents after https://nchlswhttkr.com/goto/... and ensure it is
  // alphanumeric, removing any garbage if necessary
  const path = new URL(event.request.url).pathname.slice(6);
  const key = decodeURIComponent(path).replace(/[^A-Za-z0-9]/, "");
  const redirect = shortcuts[key];
  if (redirect) {
    return new Response("", {
      status: 301,
      headers: { Location: redirect }
    });
  }

  // Otherwise, fall back to main site
  return fetch(event);
}
