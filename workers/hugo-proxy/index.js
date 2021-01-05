addEventListener("fetch", (event) => {
  event.respondWith(handleRequest(event));
});

async function handleRequest(event) {
  try {
    const url = new URL(event.request.url);

    const WRITE_ALLOWED = url.searchParams.get("secret") === ENV_WRITER_SECRET;

    // YOUTUBE VIDEOS
    if (url.pathname === "/youtube") {
      const id = url.searchParams.get("id");
      if (!id) {
        throw new Error("Expected ID for YouTube video");
      }

      let responseKey = `youtube_${id}`;
      let response = await CACHED_RESPONSES.get(responseKey);
      if (!response) {
        if (!WRITE_ALLOWED) {
          throw new Error("Cached response not found, write permission needed");
        }
        response = await loadYoutubeVideo(id);
        await CACHED_RESPONSES.put(responseKey, response);
      }

      return new Response(response, {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // BANDCAMP ALBUMS
    if (url.pathname === "/bandcamp") {
      const artist = url.searchParams.get("artist");
      const album = url.searchParams.get("album");
      if (!artist) {
        throw new Error("Expected artist for Bandcamp album");
      } else if (!album) {
        throw new Error("Expected album for Bandcamp album");
      }

      let responseKey = `bandcamp_${artist}_${album}`;
      let response = await CACHED_RESPONSES.get(responseKey);
      if (!response) {
        if (!WRITE_ALLOWED) {
          throw new Error("Cached response not found, write permission needed");
        }
        response = await loadBandcampAlbum(artist, album);
        await CACHED_RESPONSES.put(responseKey, response);
      }

      return new Response(response, {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 404
    return new Response("404 Not Found", { status: 404 });
  } catch (error) {
    return new Response(error, { status: 500 });
  }
}

async function loadYoutubeVideo(id) {
  const video = await fetch(
    `https://www.googleapis.com/youtube/v3/videos?id=${id}&key=${ENV_YOUTUBE_SECRET_KEY}&part=snippet`
  ).then((r) => {
    if (r.status !== 200) {
      throw new Error(`Request to YouTube failed, received ${r.status}`);
    }
    return r.json();
  });

  return JSON.stringify({
    channel_url: `https://youtube.com/channel/${video.items[0].snippet.channelId}`,
    channel_title: video.items[0].snippet.channelTitle,
    thumbnail_url: video.items[0].snippet.thumbnails.standard.url,
    video_title: video.items[0].snippet.title,
    video_url: `https://youtube.com/watch?v=${video.items[0].id}`,
  });
}

async function loadBandcampAlbum(artist, album) {
  const url = `https://${artist}.bandcamp.com/album/${album}`;
  let bandcamp = await fetch(url).then((r) => {
    if (r.status === 200) {
      return r.text();
    }
    throw new Error(`Received ${r.status} from Bandcamp`);
  });

  const albumId = bandcamp.match(/<!-- album id ([0-9]*) -->\n$/);
  if (albumId === null) {
    throw new Error("Could not find album ID");
  }

  return JSON.stringify({
    albumId: albumId[1],
  });
}
