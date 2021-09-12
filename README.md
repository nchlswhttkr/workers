<!-- TODO: Use Boom for error handling -->

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

### [hugo-media-proxy](./workers/hugo-media-proxy)

Serves media from third party sites.

### [hugo-proxy](./workers/hugo-proxy)

Transforms and caches responses from various sites (Bandcamp, YouTube, Twitter, etc...) for embedded content on my website.

### [nchlswhttkr-dot-com](./workers/nchlswhttkr-dot-com)

Handles redirects from my old domain to various destinations.

### [newsletter-subscription-form](./workers/newsletter-subscription-form)

Manages requests to subscribe/unsubscribe from my newsletter.

### [terraform-registry](./workers/terraform-registry)

Mimics a Terraform registry to serve my custom providers.

### ~~[bandcamp-embed-cors-proxy](./workers/bandcamp-embed-cors-proxy)~~

> :exclamation: I've moved this worker in with the embed itself at https://github.com/nchlswhttkr/bandcamp-mini-embed. I don't maintain this anymore.

Proxies requests for my custom Bandcamp embed, adding CORS headers.

### ~~[counter](./workers/counter)~~

> :exclamation: I've taken this down since I'm not actively using it at the moment. You can still view the source code.

Having some fun with isolate persistence in Cloudflare Workers.

### ~~[experimental-golang-worker](./workers/experimental-golang-worker)~~

> :exclamation: I've taken this down since I'm not actively using it at the moment. You can still view the source code.

Running Golang as WASM inside Cloudflare Workers.

### ~~[inject-env-loader](./webpack/inject-env-loader)~~

> :exclamation: I wrote this before you were able to [include secrets/environment variables](https://blog.cloudflare.com/workers-secrets-environment/) with your Workers. I've since migrated, and I don't maintain this anymore.

A Webpack loader to inject environment variables as a part of builds.

### ~~[markdown-reader](./workers/markdown-reader)~~

> :exclamation: I've since taken this down, as I'm not using it anymore. Consider a service like [nicedoc.io](https://nicedoc.io/) if you're looking for a markdown viewer of GitHub-hosted files.

A reader for web-hosted markdown files.
