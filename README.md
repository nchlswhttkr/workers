# workers

My [Cloudflare Workers](https://workers.dev), for assorted purposes.

This is a [Rush](https://rushjs.io) project that uses [PNPM](https://pnpm.js.org/), none of these packages are published publicly.

|                                                                        |                                                                        |
| ---------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| [@nchlswhttkr/hero-of-time-link](#hero-of-time-link)                   | Redirects requests based off a dynamic file                            |
| [@nchlswhttkr/inject-env-loader](#inject-env-loader)                   | A Webpack loader to inject environment variables as a part of builds   |
| [@nchlswhttkr/blog-logging](#blog-logging)                             | Logs requests to read pages from my blog                               |
| [@nchlswhttkr/newsletter-worker](#newsletter)                          | A Cloudflare worker that posts links to my newsletter channel on Slack |
| [@nchlswhttkr/echo-worker](#echo)                                      | Echoes webhooks requests to one of my Slack channels                   |
| [@nchlswhttkr/counter-worker](#counter)                                | Having some fun with isolate persistence in Cloudflare Workers         |
| [@nchlswhttkr/experimental-golang-worker](#experimental-golang-worker) | Running Golang as WASM inside Cloudflare Workers                       |

## Usage

You should make sure you can publish your workers.

1. Create `set-cloudflare-secrets.sh` by copying the template, and replace it with your Cloudflare secrets/identifiers.

   - This should be `CF_ACCOUNT_ID`, `CF_API_TOKEN` and a `CF_ZONE_ID` for your default zone.

1. Make sure you have [wrangler](https://github.com/cloudflare/wrangler) installed.

After this, you can publish all your workers, or just a single chosen worker.

```sh
rush build
rush build --to @nchlswhttkr/blog-logging-worker
```

Rush will not rebuild a package unless it changes, or one of its dependencies changes. Changes to `.gitignore`'d files (for example, files with secrets) **will be ignored**.

You can always force a rebuild of a particular package or all packages.

```sh
rush rebuild
rush rebuild --to @nchlswhttkr/blog-logging-worker
```

## Packages

### hero-of-time-link

![Link and Ezlo from The Legend of Zelda: The Minish Cap dashing forward](https://gamepedia.cursecdn.com/zelda_gamepedia_en/a/af/PegasusBootsTMC.png)

My personal shortcut service. For example, https://nchlswhttkr.com/goto/link-worker redirects back here.

The links in https://nchlswhttkr.keybase.pub/links.json are used to redirect requests. The key for each links must be **alphanumeric**.

This isn't the most resilient code, but it makes it easy for me to add new links by editing a file locally. Keybase automatically syncs this file as I make changes.

### inject-env-loader

A Webpack loader to inject environment variables as a part of builds.

> :exclamation: I wrote this before you were able to [include secrets/environment variables](https://blog.cloudflare.com/workers-secrets-environment/) with your Workers. I might remove it at a later point, but I'm keeping my current setup unchanged for these low-risk projects.

Identifiers prefixed with `ENV_` will be replaced with the environment variable value. Additionally, will attempt to load environment variables from a `.env` file in the working directory.

```js
if (password === ENV_PASSWORD) {
  // do authenticated work
}

// becomes
if (password === "abc123") {
  // do authenticated work
}
```

### blog-logging

Logs requests to read pages from my blog.

Requires a `LOGGING_URL` to be set via [@nchlswhttkr/inject-env-loader](#inject-env-loader) when publishing.

### newsletter

A Cloudflare worker that posts links to my newsletter channel on Slack.

The necessary secets, `SLACK_INCOMING_MESSAGE_URL` and `SECRET_TOKEN`, are added by [@nchlswhttkr/inject-env-loader](#inject-env-loader) when publishing to Cloudflare.

```sh
curl -X POST "https://newsletter.nchlswhttkr.workers.dev"
    -H "Secret={{ your-secret-access-token }}"
    -H "Content-Type=application/x-www-form-urlencoded"
    -d 'url={{ link-to-post-url-encoded }}'
```

### echo

Echoes webhooks requests to one of my Slack channels.

The necessary secets, `SLACK_INCOMING_MESSAGE_URL` and `SECRET_TOKEN`, are added by [@nchlswhttkr/inject-env-loader](#inject-env-loader) when publishing to Cloudflare.

Prepend the secret to the URL path, since we cannot rely on headers/cookies.

```sh
curl -X POST "https://echo.nchlswhttkr.workers.dev/{{ your-secret-access-token }}/github"
    -H "SOME-HEADER=SOME-VALUE"
    -d 'Hello world!'
```

![An example screenshot showing data from the above request](./workers/echo/screenshot.png)

### counter

Having some fun with isolate persistence in Cloudflare Workers.

Repeated requests to https://counter.nchlswhttkr.workers.dev will increment the counter, so long as you continue to hit the same node and the isolate is not discarded.

### experimental-golang-worker

Running Golang as WASM inside Cloudflare Workers.

You will need to have [TinyGo](https://tinygo.org/) installed. You can use the Go compiler, but the output it produces is much larger.

Take a look at [main.go](./workers/golang-wasm-experiment/main.go) and [index.js](./workers/golang-wasm-experiment/index.js) if you would like to see the Golang in action.
