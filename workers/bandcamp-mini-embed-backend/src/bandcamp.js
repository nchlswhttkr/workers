import Boom from "@hapi/boom";

/**
 * Requests embed data about an album from the Bandcamp embed endpoint.
 *
 * Details like referrer and client IP aren't strictly necessary, but keeping
 * them helps stay faithful to the behaviour of Bandcamp's native embed.
 *
 * TODO: Should allowed origins (referrers) be restricted?
 */
export async function getAlbumPlayerData(albumId, clientIP, referrer) {
  // Form a request with the necessary shape
  const request = new Request(
    `https://bandcamp.com/EmbeddedPlayer/ref=${encodeURIComponent(
      referrer,
    )}/album=${albumId}`,
  );
  request.headers.set("X-Forwarded-For", clientIP);
  request.headers.set("Forwarded", `for=${clientIP}`);

  const response = await fetch(request);
  if (response.status !== 200) {
    throw Boom.internal(`Received ${response.status} from Bandcamp`);
  }
  const text = await response.text();

  // Player data is stored as a data attribute in the document... hmm...
  const match = text.match(/data-player-data="([^"]*)"/);
  if (match === null) {
    throw Boom.internal("Could not read player data from Bandcamp");
  }
  return match[1].replace(/&quot;/g, '"');
}

/**
 * Albums in a Bandcamp embed are loaded by their ID, rather than a URL/name.
 * Unfortunately these IDs are not easily available to regular users.
 *
 * Similarly, an album's title ("{{album}}, by {{artist}}") is used as a
 * placeholder for the embed when it fails to load and for noscript users. It
 * needs to be available in the embed snippet.
 *
 * Both of these problems can be solved by requesting the URL of the album in
 * question, and parsing the response to find these values. Parsing HTML with
 * text matching is fairly janky, but its workable with these small queries.
 */
export async function getAlbumDetails(url) {
  let response = await fetch(url);
  if (response.status !== 200) {
    throw Boom.internal(`Received ${response.status} from Bandcamp`);
  }
  const text = await response.text();

  let albumId;
  const matchAlbumId = text.match(/<!-- album id ([0-9]*) -->\n$/);
  if (matchAlbumId === null) {
    throw Boom.internal("Could not find album ID");
  }
  albumId = matchAlbumId[1];

  let title;
  let matchTitle = text.match(/<meta name="title" content="(.*)">/);
  if (matchTitle === null) {
    throw Boom.internal("Could not find album title");
  }
  title = matchTitle[1];

  return {
    albumId,
    title,
  };
}
