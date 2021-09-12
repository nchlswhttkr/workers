# ~~markdown-reader~~

> :exclamation: I've since taken this down, as I'm not using it anymore. Consider a service like [nicedoc.io](https://nicedoc.io/) if you're looking for a markdown viewer of GitHub-hosted files.

A reader for web-hosted markdown files. It parses markdown files from the web server-side and returns the response.

Takes advantage of HTTP/2 server push and preloading to get a faster paint for newer clients.

To look at a particular file, pass it in via the `url` parameter.
