addEventListener("fetch", (event) => {
  event.respondWith(handleRequest(event));
});

async function handleRequest(event) {
  function redirect(destination) {
    return new Response("", {
      status: 301,
      headers: { Location: destination },
    });
  }

  const url = new URL(event.request.url);
  if (url.hostname.startsWith("blog")) {
    return redirect(`https://nicholas.cloud/blog${url.pathname}`);
  } else if (url.hostname.startsWith("resume")) {
    return redirect(`https://nicholas.cloud/resume`);
  } else if (url.hostname.startsWith("source")) {
    return redirect("https://github.com/nchlswhttkr/website/");
  } else if (url.hostname.startsWith("barhack")) {
    return redirect("https://github.com/nchlswhttkr/barhack/");
  } else if (url.hostname.startsWith("www")) {
    return redirect(`https://nicholas.cloud${url.pathname}`);
  }
  return redirect(`https://nicholas.cloud${url.pathname}`);
}
