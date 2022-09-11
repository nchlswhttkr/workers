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
  switch (url.hostname) {
    case "blog.nchlswhttkr.com":
      return redirect(`https://nicholas.cloud/blog${url.pathname}`);
    case "resume.nchlswhttkr.com":
      return redirect(`https://nicholas.cloud/resume`);
    case "source.nchlswhttkr.com":
      return redirect("https://github.com/nchlswhttkr/website/");
    case "barhack.nchlswhttkr.com":
      return redirect("https://github.com/nchlswhttkr/barhack/");
    case "www.nchlswhttkr.com":
      return redirect(`https://nicholas.cloud${url.pathname}`);
    case "dalordish.nchlswhttkr.com":
      return redirect("https://www.youtube.com/watch?v=ktxtvMqmqu8");
    default:
      return redirect(`https://nicholas.cloud${url.pathname}`);
  }
}
