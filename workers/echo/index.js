addEventListener("fetch", event => {
  event.respondWith(handleRequest(event.request));
});

/**
 * @param {Request} request
 */
async function handleRequest(request) {
  try {
    if (request.method == "GET" || request.method == "HEAD") {
      return new Response(undefined, {
        status: 302,
        headers: {
          Location: "https://github.com/nchlswhttkr/workers#echo"
        }
      });
    }

    // A few requirements to check before proceeding
    if (request.method !== "POST") {
      return new Response("Must be POST request", { status: 400 });
    }
    if (!request.url.includes(ENV_SECRET_KEY)) {
      return new Response("Must provide a valid SECRET", { status: 400 });
    }

    // Grab content from the request
    const DATE = new Date().toISOString();
    const PATH = "/" + request.url.split("/")[4];
    const HEADERS = Array.from(request.headers.entries())
      .map(([key, value]) => `${key.padEnd(24, " ")}\t${value}`)
      .join("\n");
    const BODY = await request.text();

    // Format into a nice message for Slack
    const text = `
New request to \`${PATH}\` at \`${DATE}\`

Headers
\`\`\`
${HEADERS}
\`\`\`

Body
\`\`\`
${BODY}
\`\`\`
`;

    // Post to our #echo Slack channel
    const r = await fetch(ENV_SLACK_INCOMING_MESSAGE_URL, {
      method: "POST",
      headers: {
        "Content-type": "application/json"
      },
      body: JSON.stringify({ text })
    });

    if (!r.ok) {
      throw new Error(`Received ${r.status} from Slack`);
    }
  } catch (error) {
    console.error(error);
    return new Response("An error occured", { status: 500 });
  }
  return new Response("Accepted", { status: 201 });
}
