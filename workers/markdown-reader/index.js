const marked = require("marked");

addEventListener("fetch", event => {
  event.respondWith(handleRequest(event));
});

async function handleRequest(event) {
  // Immediately respond with CSS
  if (/reader.css$/.test(event.request.url)) {
    return new Response(CSS, { headers: { "Content-Type": "text/css" } });
  }

  // Otherwise, start streaming back a response of the parsed markdown
  let { readable, writable } = new TransformStream();
  let url =
    new URL(event.request.url).searchParams.get("url") ||
    "https://raw.githubusercontent.com/nchlswhttkr/workers/master/README.md";

  // Don't need to await, the requests persists while the stream is open
  streamMarkdownFromUrl(writable, url);

  return new Response(readable, {
    status: 200,
    headers: {
      "Content-Type": "text/html",
      Link: "</reader.css>; rel=preload; as=style"
    }
  });
}

const bodies = new Map();
async function streamMarkdownFromUrl(writable, url) {
  const writer = writable.getWriter();
  const encoder = new TextEncoder();

  // Send an initial chunk to trigger a server response
  // Gives clients a chance to preload assets (CSS) before the <body> arrives
  await writer.write(encoder.encode(HTML_HEAD));

  let body = bodies.get(url);
  if (!body) {
    const markdown = await fetch(url).then(r => r.text());
    body = marked(markdown);
    bodies.set(url, body);
  }
  await writer.write(encoder.encode(HTML_BODY_BEFORE + body + HTML_BODY_AFTER));
  await writer.close();
}

const CSS = `
body {
    margin: 0;
}

body > article {
    margin: 0 auto;
    padding: 1em;
    max-width: 50em;
    font-family: sans-serif;
    line-height: 1.4em;
    background-color: #eee;
    color: #333;
}

body img {
    max-width: 100%;
}
`;
const HTML_HEAD = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="preload" as="style" href="/reader.css">
    <link rel="stylesheet" type="text/css" href="/reader.css">
</head>
`;
const HTML_BODY_BEFORE = `
<body>
<article>
`;
const HTML_BODY_AFTER = `
</article>
</body>
</html>
`;
