<!-- TODO: Use Boom for error handling -->

# workers

My [Cloudflare Workers](https://workers.dev), for assorted purposes.

This is a [Rush](https://rushjs.io) project that uses [PNPM](https://pnpm.js.org/), none of these packages are published publicly.

## Usage

You'll need credentials on hand in your [`pass`](https://passwordstore.org/) store, and [Rush](https://rushjs.io/) needs to be installed.

```sh
nvm install
nvm use
npm install --global @microsoft/rush
rush update
rush build
```

Subsequent builds will be incremental, and won't run from changes to ignored files and external sources (secrets in `pass`, files outside a project's folder). In this case, you can force a full rebuild of a project and its dependencies.

```sh
rush rebuild --to "@nchlswhttkr/template-worker"
```

## Packages

| Package                                                                               | Description                                                                                                                    |
| ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| [libraries/cloudflare-workers-otel-trace](./libraries/cloudflare-workers-otel-trace/) | Initialises an OTel tracer compatible with Cloudflare Workers                                                                  |
| [libraries/esbuild-plugin-handlebars/](./libraries/esbuild-plugin-handlebars/)        | An esbuild plugin to load and precompile Handlebars templates                                                                  |
| [libraries/otlp-exporter-fetch](./libraries/otlp-exporter-fetch/)                     | Implements an OTLP exporter using `fetch()` for environments that do not support `XMLHttpRequest` and `Navigator.sendBeacon()` |
| [workers/belles](./workers/belles/)                                                   | Records my transactions at [Belles Hot Chicken](https://belleshotchicken.com/)                                                 |
| [workers/enforce-https](./workers/enforce-https/)                                     | Enforces HTTPS for requests to my website and any subdomains                                                                   |
| [workers/hero-of-time-link](./workers/hero-of-time-link/)                             | A shortcut service using Workers KV                                                                                            |
| [workers/hugo-media-proxy](./workers/hugo-media-proxy/)                               | Serves media from third party sites for my personal website                                                                    |
| [workers/hugo-proxy](./workers/hugo-proxy/)                                           | Transforms and caches responses from various sites (Bandcamp, YouTube, Twitter, etc...) for embedded                           |
| [workers/nchlswhttkr-dot-com](./workers/nchlswhttkr-dot-com/)                         | Handles redirects from my old domain to various destinations                                                                   |
| [workers/newsletter-subscription-form](./workers/newsletter-subscription-form/)       | Manages requests to subscribe/unsubscribe from my newsletter                                                                   |
| [workers/terraform-registry](./workers/terraform-registry/)                           | Mimics a Terraform registry to serve my custom providers                                                                       |

<!-- bandcamp-embed-cors-proxy https://github.com/nchlswhttkr/workers/tree/5c6b3d25a38e52a68632987ce9ba8772a076a43a/workers/bandcamp-embed-cors-proxy -->

<!-- counter https://github.com/nchlswhttkr/workers/tree/5c6b3d25a38e52a68632987ce9ba8772a076a43a/workers/counter -->

<!-- experimental-golang-worker https://github.com/nchlswhttkr/workers/tree/5c6b3d25a38e52a68632987ce9ba8772a076a43a/workers/experimental-golang-worker -->

<!-- inject-env-loader https://github.com/nchlswhttkr/workers/tree/5c6b3d25a38e52a68632987ce9ba8772a076a43a/webpack/inject-env-loader -->

<!-- markdown-reader https://github.com/nchlswhttkr/workers/tree/5c6b3d25a38e52a68632987ce9ba8772a076a43a/workers/markdown-reader -->

<!-- rss-feeds https://github.com/nchlswhttkr/workers/tree/e02638fd69f0747b9187a4e0aecc3753a412e4d3/workers/rss-feeds -->
