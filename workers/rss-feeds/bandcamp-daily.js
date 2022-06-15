export async function getBandcampDailyArticles() {
  const finder = new BandcampDailyArticleFinder();

  await new HTMLRewriter()
    .on('div[class="features"] a[class="title"]', finder)
    .transform(await fetch("https://daily.bandcamp.com/features"))
    .text();

  return finder.urls.map((url, i) => ({
    title: finder.titles[i],
    description: `Read the feature <em><a href="${url}">${finder.titles[i]}</a></em> on Bandcamp Daily.`,
    url,
  }));
}

class BandcampDailyArticleFinder {
  constructor() {
    this.urls = [];
    this.titles = [""];
  }

  element(element) {
    this.urls.push("https://daily.bandcamp.com" + element.getAttribute("href"));
  }

  comments() {
    /* void */
  }

  text(element) {
    this.titles[this.titles.length - 1] += element.text;
    if (element.lastInTextNode) {
      this.titles.push("");
    }
  }
}
