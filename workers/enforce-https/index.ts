export default {
  async fetch(request) {
    const url = new URL(request.url);
    if (url.protocol !== "http:") {
      return new Response("", { status: 418 });
    }

    url.protocol = "https:";
    return new Response("", {
      status: 301,
      headers: { Location: url.toString() },
    });
  },
};
