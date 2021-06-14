# workers

My [Cloudflare Workers](https://workers.dev), for assorted purposes.

This is a [Rush](https://rushjs.io) project that uses [PNPM](https://pnpm.js.org/), none of these packages are published publicly.

|                                                                            |                                                                                                                            |
| -------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| [@nchlswhttkr/hero-of-time-link](#hero-of-time-link)                       | Redirects requests based off a dynamic file                                                                                |
| [@nchlswhttkr/newsletter-subscription-form](#newsletter-subscription-form) | Manages requests to subscribe/unsubscribe from my newsletter                                                               |
| [@nchlswhttkr/markdown-reader](#markdown-reader)                           | A reader for web-hosted markdown files                                                                                     |
| [@nchlswhttkr/experimental-golang-worker](#experimental-golang-worker)     | Running Golang as WASM inside Cloudflare Workers                                                                           |
| [@nchlswhttkr/nchlswhttkr-dot-com](#nchlswhttkr-dot-com)                   | Handles redirects from my old domain to various destinations                                                               |
| [@nchlswhttkr/inject-env-loader](#inject-env-loader)                       | A Webpack loader to inject environment variables as a part of builds                                                       |
| [@nchlswhttkr/counter](#counter)                                           | Having some fun with isolate persistence in Cloudflare Workers                                                             |
| [@nchlswhttkr/hugo-proxy](#hugo-proxy)                                     | Transforms and caches responses from various sites (Bandcamp, YouTube, Twitter, etc...) for embedded content on my website |
| [@nchlswhttkr/bandcamp-embed-cors-proxy](#bandcamp-embed-cors-proxy)       | Proxies requests for my custom Bandcamp embed, adding CORS headers                                                         |

## Usage

You should make sure you can publish your workers.

1. Create `set-cloudflare-secrets.sh` by copying the template, and replace it with your Cloudflare secrets/identifiers.

   - This should be `CF_ACCOUNT_ID`, `CF_API_TOKEN` and a `CF_ZONE_ID` for your default zone.

1. Make sure you have [wrangler](https://github.com/cloudflare/wrangler) installed.

After this, you can publish all your workers, or just a single chosen worker.

```sh
rush build
rush build --to @nchlswhttkr/newsletter-subscription-form
```

Rush will not rebuild a package unless it changes, or one of its dependencies changes. Changes to `.gitignore`'d files (for example, files with secrets) **will be ignored**.

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

### hero-of-time-link

![Link and Ezlo from The Legend of Zelda: The Minish Cap dashing forward](https://gamepedia.cursecdn.com/zelda_gamepedia_en/a/af/PegasusBootsTMC.png)

My personal shortcut service off Workers KV. For example, https://nicholas.cloud/goto/recursion redirects back here.

Requests are redirected based on the links in a `shortcuts.json` file. The key for each shortcut must be **alphanumeric**.

Links will only be updated if you **force a rebuild** (`rush rebuild --to @nchlswhttkr/hero-of-time-link`).

---

### newsletter-subscription-form

![A menu screen from Pokémon Mystery Dungeon featuring Chikorita, Totodile, and Pelipper](https://pbs.twimg.com/media/ETYATeyUUAApTGA?format=jpg&name=large)

Manages requests to subscribe to [my newsletter](https://nicholas.cloud/newsletter/).

| Method | Path                            | Description                                                          |
| ------ | ------------------------------- | -------------------------------------------------------------------- |
| `GET`  | `/newsletter/subscribe/`        | The form to subscribe to the mailing list.                           |
| `POST` | `/newsletter/subscribe/`        | Subscribes a user to the mailing list, expects completed form data.  |
| `*`    | `/newsletter/subscribe/confirm` | Confirms a mailing list subscription, expects email and a signature. |

It needs a few secrets to be provided with [@nchlswhttkr/inject-env-loader](#inject-env-loader).

- `EMAIL_SIGNING_SECRET` - The sequence of bytes used to sign emails in confirmation links
- `MAILGUN_API_KEY` - An API key to make calls to the Mailgun API

Some values are hardcoded into this script (email sending domain, mailing list name), you'll need to change those before deploying this.

To generate a new signing secret, you can use this snippet. Changing this secret will invalidate all existing confirmation links.

```js
Array.from(crypto.getRandomValues(new Uint8Array(16)))
  .map((n) => n.toString(16).padStart(2, "0"))
  .join();
```

---

### markdown-reader

A reader for web-hosted markdown files. It parses markdown files from the web server-side and returns the response.

Takes advantage of HTTP/2 server push and preloading to get a faster paint for newer clients.

To look at a particular file, pass it in via the `url` parameter.

---

### experimental-golang-worker

Running Golang as WASM inside Cloudflare Workers.

You will need to have [TinyGo](https://tinygo.org/) installed.

---

### nchlswhttkr-dot-com

Handles redirects from my old domain to various destinations.

For reference, you can see [the old Nginx config](https://gist.github.com/nchlswhttkr/77239b402f2481c01c6e3ffa1a59127a) this worker replaces.

---

### inject-env-loader

A Webpack loader to inject environment variables as a part of builds.

> :exclamation: I wrote this before you were able to [include secrets/environment variables](https://blog.cloudflare.com/workers-secrets-environment/) with your Workers. I might remove it at a later point.

For example, if the environment variable `PASSWORD` is set to `abc123`, your build output would resemble this.

```diff
- if (password === ENV_PASSWORD) {
+ if (password === "abc123") {
    // do authenticated work
  }
```

---

### counter

Having some fun with isolate persistence in Cloudflare Workers.

Repeated requests to https://counter.nchlswhttkr.workers.dev will increment the counter, so long as you continue to hit the same node and the isolate is not discarded.

---

### hugo-proxy

Transforms and caches responses from various sites (Bandcamp, YouTube, Twitter, etc...) for embedded content on my website.

<!-- TODO explain -->

---

### bandcamp-embed-cors-proxy

Proxies requests for [my custom Bandcamp embed](https://github.com/nchlswhttkr/bandcamp-mini-embed), adding CORS headers.
