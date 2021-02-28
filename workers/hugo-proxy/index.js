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

    // VIMEO VIDEOS
    if (url.pathname === "/vimeo") {
      const id = url.searchParams.get("id");
      if (!id) {
        throw new Error("Expected ID for Vimeo video");
      }

      let responseKey = `vimeo_${id}`;
      let response = await CACHED_RESPONSES.get(responseKey);
      if (!response) {
        if (!WRITE_ALLOWED) {
          throw new Error("Cached response not found, write permission needed");
        }
        response = await loadVimeoVideo(id);
        await CACHED_RESPONSES.put(responseKey, response);
      }

      return new Response(response, {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // TWITTER TWEETS
    if (url.pathname === "/twitter") {
      const id = url.searchParams.get("id");
      if (!id) {
        throw new Error("Expected ID for Twitter tweet");
      }

      let responseKey = `twitter_${id}`;
      let response = await CACHED_RESPONSES.get(responseKey);
      if (!response) {
        if (!WRITE_ALLOWED) {
          throw new Error("Cached response not found, write permission needed");
        }
        response = await loadTwitterTweet(id);
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
    thumbnail_url: video.items[0].snippet.thumbnails.high.url,
    video_title: video.items[0].snippet.title,
    video_url: `https://youtube.com/watch?v=${video.items[0].id}`,
  });
}

async function loadVimeoVideo(id) {
  const video = await fetch(`https://api.vimeo.com/videos/${id}`, {
    headers: { Authorization: "Bearer " + ENV_VIMEO_SECRET_KEY },
  }).then((r) => {
    if (r.status !== 200) {
      throw new Error(`Request to Vimeo failed, received ${r.status}`);
    }
    return r.json();
  });

  const width = 480;
  const height = Math.floor((width * video.height) / video.width);

  // prettier-ignore
  return JSON.stringify({
    channel_url: video.user.link,
    channel_title: video.user.name,
    thumbnail_url: `https://i.vimeocdn.com/video/${video.pictures.uri.split('/')[4]}_${width}x${height}.jpg`, // "?r=pad"
    thumbnail_height: height,
    thumbnail_width: width,
    video_title: video.name,
    video_url: video.link,
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

async function loadTwitterTweet(id) {
  let tweet = await fetch(
    `https://cdn.syndication.twimg.com/tweet?id=${id}`
  ).then((r) => {
    if (r.status === 200) {
      return r.json();
    }
    throw new Error(`Received ${r.status} from Twitter`);
  });

  let text = tweet.text;
  // TODO should use text substitution
  for (let media of tweet.entities.media || []) {
    text = text.replace(media.url, "");
  }
  for (let url of tweet.entities.urls) {
    text = text.replace(
      url.url,
      `<a href="${url.expanded_url}">${url.display_url}</a>`
    );
  }
  for (let hashtag of tweet.entities.hashtags) {
    text = text.replace(
      `#${hashtag.text}`,
      `<a href="https://twitter.com/hashtag/${hashtag.text}?src=hashtag_click">#${hashtag.text}</a>`
    );
  }
  for (let mention of tweet.entities.user_mentions) {
    text = text.replace(
      `@${mention.screen_name}`,
      `<a href="https://twitter.com/${mention.screen_name}">@${mention.screen_name}</a>`
    );
  }
  text = text.replace(/\n/g, "<br>");
  // TODO Some injection protection check would be nice, but not essential

  let video =
    tweet.video &&
    tweet.video.variants
      .filter((v) => v.type === "video/mp4")
      .map((video) => {
        const dimensions = video.src.match(/\/vid\/([0-9]+)x([0-9]+)\//);
        if (dimensions === null) {
          throw new Error("Could not determine video dimensions");
        }
        return {
          src: video.src,
          type: video.type,
          width: dimensions[1],
          height: dimensions[2],
        };
      })
      // TECH DEBT IN ACTION to find the right size video
      .sort((v1, v2) =>
        Number.parseInt(v1.width) > Number.parseInt(v2.width) ? 1 : -1
      )
      .find((v) => Number.parseInt(v.width) >= 400);

  return JSON.stringify({
    author_name: tweet.user.name,
    author_username: tweet.user.screen_name,
    author_url: "https://twitter.com/" + tweet.user.screen_name,
    author_avatar_url: tweet.user.profile_image_url_https,
    created_at: new Date(tweet.created_at).toUTCString().substring(5),
    text,
    raw_text: tweet.text,
    like_tweet_url: "https://twitter.com/intent/like?tweet_id=" + tweet.id_str,
    reply_tweet_url:
      "https://twitter.com/intent/tweet?in_reply_to=" + tweet.id_str,
    retweet_tweet_url:
      "https://twitter.com/intent/retweet?tweet_id=" + tweet.id_str,
    tweet_url: `https://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}`,
    photos: (tweet.photos || []).map((p) => ({
      alt: p.accessibilityLabel,
      url: p.url,
      width: p.width,
      height: p.height,
    })),
    video: video || null,
  });
}
