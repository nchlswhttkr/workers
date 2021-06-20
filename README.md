# workers

My [Cloudflare Workers](https://workers.dev), for assorted purposes.

This is a [Rush](https://rushjs.io) project that uses [PNPM](https://pnpm.js.org/), none of these packages are published publicly.

## Usage

You should make sure you can publish your workers.

1. Have credentials ready in [`pass`](https://passwordstore.org/).

1. Make sure you have [wrangler](https://github.com/cloudflare/wrangler) installed.

After this, you can publish all your workers, or just a single chosen worker.

```sh
rush build
rush build --to @nchlswhttkr/newsletter-subscription-form
```

Rush will not rebuild a package unless it changes, or one of its dependencies changes. Changes to `.gitignore`'d files and external sources (secrets within `pass`) **will be ignored**.

You can always force a rebuild of a particular package or all packages.

```sh
rush rebuild
rush rebuild --to @nchlswhttkr/newsletter-subscription-form
```

New workers can be created from the template worker. Make sure to add them the `rush.json` config so they will be published!

```
./new-worker.sh "new-worker-name"
```

## Packages

### [hero-of-time-link](./workers/hero-of-time-link)

A shortcut service using Workers KV.

### [newsletter-subscription-form](./workers/newsletter-subscription-form)

Manages requests to subscribe/unsubscribe from my newsletter.

### [markdown-reader](./workers/markdown-reader)

A reader for web-hosted markdown files.

### [experimental-golang-worker](./workers/experimental-golang-worker)

Running Golang as WASM inside Cloudflare Workers.

### [nchlswhttkr-dot-com](./workers/nchlswhttkr-dot-com)

Handles redirects from my old domain to various destinations.

### [counter](./workers/counter)

Having some fun with isolate persistence in Cloudflare Workers.

### [hugo-proxy](./workers/hugo-proxy)

Transforms and caches responses from various sites (Bandcamp, YouTube, Twitter, etc...) for embedded content on my website.

### [bandcamp-embed-cors-proxy](./workers/bandcamp-embed-cors-proxy)

Proxies requests for my custom Bandcamp embed, adding CORS headers.

### [hugo-media-proxy](./workers/hugo-media-proxy)

Serves media from third party sites.

### ~~[inject-env-loader](./webpack/inject-env-loader)~~

> :exclamation: I wrote this before you were able to [include secrets/environment variables](https://blog.cloudflare.com/workers-secrets-environment/) with your Workers. I've since migrated, and I don't maintain this anymore.

A Webpack loader to inject environment variables as a part of builds.
