# inject-env-loader

> :exclamation: I wrote this before you were able to [include secrets/environment variables](https://blog.cloudflare.com/workers-secrets-environment/) with your Workers. I've since migrated, and I don't maintain this anymore.

A Webpack loader to inject environment variables as a part of builds.

For example, if the environment variable `PASSWORD` is set to `abc123`, your build output would resemble this.

```diff
- if (password === ENV_PASSWORD) {
+ if (password === "abc123") {
    // do authenticated work
  }
```
