import Boom from "@hapi/boom";
import Call from "@hapi/call";
import { env } from "cloudflare:workers";

import { getAlbumDetails, getAlbumPlayerData } from "./bandcamp.js";

/**
 * To get Handlebars to run on a worker (without Webpack's handlebars-loader),
 * either the global or window APIs need to be available. Using an implicit
 * global achieves this, even if it janky.
 */
global = {};
import Handlebars from "handlebars";
import embedTemplate from "./templates/embed.hbs";
import homeTemplate from "./templates/home.hbs";
import exampleTemplate from "./templates/examples.hbs";

const router = new Call.Router();
router.add({ method: "get", path: "/" }, getEmbedPage);
router.add(
  { method: "get", path: "/album/{albumId}" },
  proxyAlbumEmbedDataRequest,
);
router.add(
  { method: "get", path: "/examples/" },
  getExamplePage,
  // Use template page for loading
  // assetRouteGenerator(require("./examples.html"), "text/html"),
);
router.add({ method: "get", path: "/robots.txt" }, () => {
  return new Response(`User-agent: *\nDisallow: /`, {
    status: 200,
    headers: { "Content-Type": "text/plain" },
  });
});
router.add(
  { method: "get", path: "/embed/bundle.js" },
  assetRouteGenerator("bundle.js", "application/javascript"),
);
router.add(
  { method: "get", path: "/embed/bundle.css" },
  assetRouteGenerator("bundle.css", "text/css"),
);

function assetRouteGenerator(file, type) {
  return async () =>
    new Response(await env.ASSETS.get(file), {
      status: 200,
      headers: { "Content-Type": type },
    });
}

export default {
  fetch: handleRequest,
};

async function handleRequest(request) {
  try {
    const { pathname } = new URL(request.url);
    const method = request.method.toLowerCase();

    const match = router.route(method, pathname);
    if (match.isBoom) {
      throw match;
    }
    return await match.route(request, match.params);
  } catch (error) {
    if (error.isBoom) {
      console.error(error.output.payload.message);
      return new Response(error.output.payload.error, {
        status: error.output.payload.statusCode,
      });
    }

    console.error(error);
    return new Response("Interal Server Error", {
      status: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
    });
  }
}

async function proxyAlbumEmbedDataRequest(request, { albumId }) {
  const clientIP = request.headers.get("CF-Connecting-IP");
  if (clientIP === null) {
    throw Boom.badRequest("No origin IP");
  }
  const referrer = request.headers.get("Referer");
  if (referrer === null) {
    throw Boom.badRequest("No referrer");
  }

  const data = await getAlbumPlayerData(albumId, clientIP, referrer);

  return new Response(data, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": new URL(referrer).origin,
      "Content-Type": "application/json",
    },
  });
}

async function getEmbedPage(request) {
  const url = new URL(request.url).searchParams.get("url");
  let embed;
  if (url !== null) {
    const { albumId, title } = await getAlbumDetails(url);
    embed = Handlebars.template(embedTemplate)({ albumId, title, url });
  }

  return new Response(Handlebars.template(homeTemplate)({ embed }), {
    status: 200,
    headers: { "Content-Type": "text/html" },
  });
}

async function getExamplePage(request) {
  return new Response(Handlebars.template(exampleTemplate)(), {
    status: 200,
    headers: { "Content-Type": "text/html" },
  });
}
