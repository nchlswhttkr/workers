# newsletter-subscription-form

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
