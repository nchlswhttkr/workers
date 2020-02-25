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
          Location: "https://github.com/nchlswhttkr/workers#newsletter"
        }
      });
    }

    // A few requirements to check before proceeding
    if (request.method !== "POST") {
      return new Response("Must be POST request", { status: 400 });
    }
    if (request.headers.get("SECRET") !== ENV_SECRET_KEY) {
      return new Response("Must provide a valid SECRET", { status: 400 });
    }

    const url = (await request.formData()).get("url");
    const r = await fetch(ENV_SLACK_INCOMING_MESSAGE_URL, {
      method: "POST",
      headers: {
        "Content-type": "application/json"
      },
      body: JSON.stringify({
        text: url
      })
    });

    if (!r.ok) {
      throw new Error(`Received ${r.status} from Slack`);
    }
  } catch (error) {
    console.error(error);
    return new Response("An error occured", { status: 500 });
  }
  return new Response("Posted", { status: 201 });
}
