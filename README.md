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

### [belles](./workers/belles)

Records my transactions at [Belles Hot Chicken](https://belleshotchicken.com/).

### [esbuild-plugin-handlebars](./esbuild-plugins/esbuild-plugin-handlebars)

An esbuild plugin to load and precompile Handlebars templates.

### [enforce-https](./workers/enforce-https/)

Enforces HTTPS for requests to my website and any subdomains.

### [hero-of-time-link](./workers/hero-of-time-link)

A shortcut service using Workers KV.

### [hugo-media-proxy](./workers/hugo-media-proxy)

Serves media from third party sites for my personal website.

### [hugo-proxy](./workers/hugo-proxy)

Transforms and caches responses from various sites (Bandcamp, YouTube, Twitter, etc...) for embedded content on my website.

### [nchlswhttkr-dot-com](./workers/nchlswhttkr-dot-com)

Handles redirects from my old domain to various destinations.

### [newsletter-subscription-form](./workers/newsletter-subscription-form)

Manages requests to subscribe/unsubscribe from my newsletter.

### [terraform-registry](./workers/terraform-registry)

Mimics a Terraform registry to serve my custom providers.

### ~~[bandcamp-embed-cors-proxy](https://github.com/nchlswhttkr/workers/tree/5c6b3d25a38e52a68632987ce9ba8772a076a43a/workers/bandcamp-embed-cors-proxy)~~

> [!WARNING]
> I've moved this worker in with the embed itself at https://github.com/nchlswhttkr/bandcamp-mini-embed. I don't maintain this anymore.

Proxies requests for my custom Bandcamp embed, adding CORS headers.

### ~~[counter](https://github.com/nchlswhttkr/workers/tree/5c6b3d25a38e52a68632987ce9ba8772a076a43a/workers/counter)~~

> [!WARNING]
> I've taken this down since I'm not actively using it at the moment. You can still view the source code.

Having some fun with isolate persistence in Cloudflare Workers.

### ~~[experimental-golang-worker](https://github.com/nchlswhttkr/workers/tree/5c6b3d25a38e52a68632987ce9ba8772a076a43a/workers/experimental-golang-worker)~~

> [!WARNING]
> I've taken this down since I'm not actively using it at the moment. You can still view the source code.

Running Golang as WASM inside Cloudflare Workers.

### ~~[inject-env-loader](https://github.com/nchlswhttkr/workers/tree/5c6b3d25a38e52a68632987ce9ba8772a076a43a/webpack/inject-env-loader)~~

> [!WARNING]
> I wrote this before you were able to [include secrets/environment variables](https://blog.cloudflare.com/workers-secrets-environment/) with your Workers. I've since migrated, and I don't maintain this anymore.

A Webpack loader to inject environment variables as a part of builds.

### ~~[markdown-reader](https://github.com/nchlswhttkr/workers/tree/5c6b3d25a38e52a68632987ce9ba8772a076a43a/workers/markdown-reader)~~

> [!WARNING]
> I've since taken this down, as I'm not using it anymore. Consider a service like [nicedoc.io](https://nicedoc.io/) if you're looking for a markdown viewer of GitHub-hosted files.

A reader for web-hosted markdown files.

### [rss-feeds](https://github.com/nchlswhttkr/workers/tree/e02638fd69f0747b9187a4e0aecc3753a412e4d3/workers/rss-feeds)

> [!WARNING]
> I've taken this down since I'm not actively using it at the moment. You can still view the source code.

Generates RSS feeds for a few websites I browse.
