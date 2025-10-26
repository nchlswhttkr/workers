# workers [![Build status](https://badge.buildkite.com/675eb9f26c41a0cd79749ea03405b3f0dca42d83ac6d19418f.svg?branch=main)](https://buildkite.com/nchlswhttkr/workers)

My [Cloudflare Workers](https://workers.dev), for assorted purposes.

This is a [Rush](https://rushjs.io) project that uses [PNPM](https://pnpm.js.org/), none of these packages are published publicly.

## Usage

You'll need to have [Rush](https://rushjs.io/) installed.

```sh
nvm install
nvm use
npm install --global @microsoft/rush
rush update
rush build
```

Subsequent builds will be [incremental](https://rushjs.io/pages/advanced/incremental_builds/), and you can force a full rebuild of a project and its dependencies.

```sh
rush rebuild --to "@nchlswhttkr/belles"
```

To deploy workers, run their `deploy` script.

```sh
cd workers/belles
rushx deploy
```

## Packages

| Package                                                                            | Description                                                                                                                    |
| ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| [@nchlswhttkr/bandcamp-mini-embed](./frontends/bandcamp-mini-embed/)               | An embed player for Bandcamp music                                                                                             |
| [@nchlswhttkr/cloudflare-workers-otel](./libraries/cloudflare-workers-otel/)       | Provided OpenTelemetry instrumentation compatible with Cloudflare Workers                                                      |
| [@nchlswhttkr/esbuild-plugin-handlebars](./libraries/esbuild-plugin-handlebars/)   | An esbuild plugin to load and precompile Handlebars templates                                                                  |
| [@nchlswhttkr/otlp-exporter-fetch](./libraries/otlp-exporter-fetch/)               | Implements an OTLP exporter using `fetch()` for environments that do not support `XMLHttpRequest` and `Navigator.sendBeacon()` |
| [@nchlswhttkr/bandcamp-mini-embed-backend](./workers/bandcamp-mini-embed-backend/) | Serves my Bandcamp embed and proxies requests to Bandcamp                                                                      |
| [@nchlswhttkr/belles](./workers/belles/)                                           | Records my transactions at [Belles Hot Chicken](https://belleshotchicken.com/)                                                 |
| [@nchlswhttkr/enforce-https](./workers/enforce-https/)                             | Enforces HTTPS for requests to my website and any subdomains                                                                   |
| [@nchlswhttkr/hero-of-time-link](./workers/hero-of-time-link/)                     | A shortcut service using Workers KV                                                                                            |
| [@nchlswhttkr/nchlswhttkr-dot-com](./workers/nchlswhttkr-dot-com/)                 | Handles redirects from my old domain to various destinations                                                                   |
| [@nchlswhttkr/terraform-registry](./workers/terraform-registry/)                   | Mimics a Terraform registry to serve my custom providers                                                                       |

<!-- counter https://github.com/nchlswhttkr/workers/tree/5c6b3d25a38e52a68632987ce9ba8772a076a43a/workers/counter -->

<!-- experimental-golang-worker https://github.com/nchlswhttkr/workers/tree/5c6b3d25a38e52a68632987ce9ba8772a076a43a/workers/experimental-golang-worker -->

<!-- honeycomb-buildkite-events-consumer https://github.com/nchlswhttkr/workers/tree/9b85d88df9bd4a851cf0dc4f410ce5a6bdc14430/workers/honeycomb-buildkite-events-consumer -->

<!-- hugo-media-proxy https://github.com/nchlswhttkr/workers/tree/cee5e0eef392876a1c5e541cb4bd1166a9d438c4/workers/hugo-media-proxy -->

<!-- hugo-proxy https://github.com/nchlswhttkr/workers/tree/cee5e0eef392876a1c5e541cb4bd1166a9d438c4/workers/hugo-proxy -->

<!-- inject-env-loader https://github.com/nchlswhttkr/workers/tree/5c6b3d25a38e52a68632987ce9ba8772a076a43a/webpack/inject-env-loader -->

<!-- markdown-reader https://github.com/nchlswhttkr/workers/tree/5c6b3d25a38e52a68632987ce9ba8772a076a43a/workers/markdown-reader -->

<!-- newsletter-subscription-form https://github.com/nchlswhttkr/workers/tree/5cab3d7173ae9f581555e680e60e5821a2971c65/workers/newsletter-subscription-form -->

<!-- rss-feeds https://github.com/nchlswhttkr/workers/tree/e02638fd69f0747b9187a4e0aecc3753a412e4d3/workers/rss-feeds -->
