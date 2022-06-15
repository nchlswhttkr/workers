/**
 * To get Handlebars to run on a worker (without Webpack's handlebars-loader),
 * either the global or window APIs need to be available. Using an implicit
 * global achieves this, even if it janky.
 */
global = {};
Handlebars = require("handlebars");
require("./build/handlebars/feed.hbs.js");

import { getBandcampDailyArticles } from "./bandcamp-daily";

addEventListener("fetch", (event) => {
  event.respondWith(handleRequest(event));
});

async function handleRequest(event) {
  try {
    const { pathname } = new URL(event.request.url);

    let title, link, description, articles;
    console.log(pathname);
    if (pathname === "/bandcamp-daily") {
      title = "Bandcamp Daily";
      link = "https://daily.bandcamp.com/features";
      description = "Get to know your next favourite artist";
      articles = await getBandcampDailyArticles();
    } else {
      return new Response("", { status: 404 });
    }

    return new Response(
      Handlebars.templates["feed.hbs"]({ title, link, description, articles }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/xml",
        },
      }
    );
  } catch (error) {
    return new Response(error, { status: 500 });
  }
}
