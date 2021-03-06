const loaders = require("./loaders");

addEventListener("fetch", (event) => {
  event.respondWith(handleRequest(event));
});

async function handleRequest(event) {
  try {
    const url = new URL(event.request.url);
    const source = url.pathname.substring(1);

    let args;
    switch (source) {
      case "bandcamp": {
        const artist = url.searchParams.get("artist");
        if (!artist) throw new Error("Expected artist for Bandcamp album");
        const album = url.searchParams.get("album");
        if (!album) throw new Error("Expected album for Bandcamp album");
        args = [artist, album];
        loader = loaders.loadBandcampAlbum;
        break;
      }

      case "twitter": {
        const id = url.searchParams.get("id");
        if (!id) throw new Error("Expected ID for Twitter tweet");
        args = [id];
        loader = loaders.loadTwitterTweet;
        break;
      }

      case "vimeo": {
        const id = url.searchParams.get("id");
        if (!id) throw new Error("Expected ID for Vimeo video");
        args = [id];
        loader = loaders.loadVimeoVideo;
        break;
      }

      case "youtube":
        const id = url.searchParams.get("id");
        if (!id) throw new Error("Expected ID for YouTube video");
        args = [id];
        loader = loaders.loadYoutubeVideo;
        break;

      default:
        return new Response("404 Not Found", { status: 404 });
    }

    const key = `${source}_${args.join("_")}`;
    let response = await CACHED_RESPONSES.get(key);

    if (!response) {
      if (url.searchParams.get("secret") === WRITER_SECRET) {
        response = JSON.stringify(await loader(...args));
        await CACHED_RESPONSES.put(key, response);
      } else {
        return new Response("No stored response, will not fetch remotely", {
          status: 403,
        });
      }
    }

    return new Response(response, {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(error, { status: 500 });
  }
}
