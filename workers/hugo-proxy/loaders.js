// TODO: Assert API responses match schema (joi?)
// TODO: Use key listing to check for stored media without a read

export async function loadYoutubeVideo(id) {
  const video = await fetch(
    `https://www.googleapis.com/youtube/v3/videos?id=${id}&key=${YOUTUBE_SECRET_KEY}&part=snippet`
  ).then((r) => {
    if (r.status !== 200) {
      throw new Error(`Request to YouTube failed, received ${r.status}`);
    }
    return r.json();
  });

  return {
    channel_url: `https://youtube.com/channel/${video.items[0].snippet.channelId}`,
    channel_title: video.items[0].snippet.channelTitle,
    thumbnail_url: await storedMediaAt(
      video.items[0].snippet.thumbnails.high.url
    ),
    video_title: video.items[0].snippet.title,
    video_url: `https://youtube.com/watch?v=${video.items[0].id}`,
  };
}

export async function loadVimeoVideo(id) {
  const video = await fetch(`https://api.vimeo.com/videos/${id}`, {
    headers: { Authorization: "Bearer " + VIMEO_SECRET_KEY },
  }).then((r) => {
    if (r.status !== 200) {
      throw new Error(`Request to Vimeo failed, received ${r.status}`);
    }
    return r.json();
  });

  const width = 480;
  const height = Math.ceil((width * video.height) / video.width);

  // prettier-ignore
  return {
      channel_url: video.user.link,
      channel_title: video.user.name,
      thumbnail_url: await storedMediaAt(video.pictures.base_link + `_${width}x${height}.jpg`), // "?r=pad"
      thumbnail_height: height,
      thumbnail_width: width,
      video_title: video.name,
      video_url: video.link,
    }
}

export async function loadBandcampAlbum(artist, album) {
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
  let title = bandcamp.match(/<meta name="title" content="(.*)">/);
  if (title === null) {
    throw new Error("Could not find title");
  } else {
    title = title[1].replace(/&amp;/g, "&").replace(/&#39;/g, "'");
  }

  return {
    albumId: albumId[1],
    title,
  };
}

export async function loadTwitterTweet(id) {
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

  let photos = (tweet.photos || []).map((p) => ({
    alt: p.accessibilityLabel,
    url: p.url + "?name=medium",
    high_res_url: p.url + "?name=orig",
    width: p.width,
    height: p.height,
  }));
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
        Number.parseInt(v1.width) > Number.parseInt(v2.width) ? -1 : 1
      )
      .reduce((previous, current) => {
        if (previous === undefined) {
          return current;
        } else if (Number.parseInt(current.width) >= 400) {
          return current;
        }
        return previous;
      }, undefined);

  // Cache media
  for (let p of photos) {
    await storedMediaAt(p.url);
    await storedMediaAt(p.high_res_url);
  }
  if (video) {
    await storedMediaAt(video.src);
  }

  return {
    author_name: tweet.user.name,
    author_username: tweet.user.screen_name,
    author_url: "https://twitter.com/" + tweet.user.screen_name,
    author_avatar_url: await storedMediaAt(tweet.user.profile_image_url_https),
    created_at: new Date(tweet.created_at).toUTCString().substring(5),
    text,
    raw_text: tweet.text,
    like_tweet_url: "https://twitter.com/intent/like?tweet_id=" + tweet.id_str,
    reply_tweet_url:
      "https://twitter.com/intent/tweet?in_reply_to=" + tweet.id_str,
    retweet_tweet_url:
      "https://twitter.com/intent/retweet?tweet_id=" + tweet.id_str,
    tweet_url: `https://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}`,
    photos,
    video: video || null,
  };
}

// Drop-in solution to store remote media
async function storedMediaAt(url) {
  if ((await CACHED_MEDIA.get(url)) == null) {
    const media = await fetch(url).then((response) => {
      if (response.status === 200) {
        return response.arrayBuffer();
      }
      throw new Error(
        `Received ${response.status} while fetching media to store`
      );
    });
    await CACHED_MEDIA.put(url, media, {
      metadata: {
        mimeType: getMime(url),
        createdAt: new Date().toISOString(),
      },
    });
  }
  return url;
}

function getMime(url) {
  const extension = url
    .split("?")[0]
    .split(".")
    .reduce((_, value) => value);

  switch (extension) {
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "png":
      return "image/png";
    case "mp4":
      return "video/mp4";
    default:
      throw new Error("Could not determine MIME type");
  }
}
