class MailgunClient {
  /**
   * API client for Mailgun, assumes EU will be the API region.
   *
   * @param {string} apiKey A valid API key for Mailgun
   * @param {string} domain The sending domain for emails
   * @param {string} mailingList The mailing list address for subscribers
   */
  constructor(apiKey, domain, mailingList) {
    this.apiKey = apiKey;
    this.domain = domain;
    this.mailingList = mailingList;
  }

  async isEmailInMailingList(email) {
    const getMemberRequest = await fetch(
      `https://api.eu.mailgun.net/v3/lists/${this.mailingList}/members/${email}`,
      {
        headers: {
          Authorization: "Basic " + btoa("api:" + this.apiKey),
        },
      }
    );

    if (getMemberRequest.status === 200) {
      return true;
    } else if (getMemberRequest.status === 404) {
      return false;
    } else {
      throw new Error(
        `Could not get member of list ${this.mailingList} (${getMemberRequest.status})`
      );
    }
  }

  // Add a member to a mailing list
  async addMemberToMailingList(email) {
    const member = new FormData();
    member.set("address", email);
    member.set("subscribed", "no"); // do not subscribe yet
    member.set("upsert", "no"); // must not already exist
    const addMemberRequest = await fetch(
      `https://api.eu.mailgun.net/v3/lists/${this.mailingList}/members`,
      {
        method: "POST",
        headers: {
          Authorization: "Basic " + btoa("api:" + this.apiKey),
        },
        body: member,
      }
    );

    if (addMemberRequest.status !== 200) {
      throw new Error(
        `Could not add ${email} to list ${this.mailingList} (${addMemberRequest.status})`
      );
    }
  }

  // Sets the 'subscribed' status of an existing mailing list member to 'yes'.
  async setMailingListMemberAsSubscribed(email) {
    const subscription = new FormData();
    subscription.set("subscribed", "yes");
    const confirmSubscriptionRequest = await fetch(
      `https://api.eu.mailgun.net/v3/lists/${this.mailingList}/members/${email}`,
      {
        method: "PUT",
        headers: {
          Authorization: "Basic " + btoa("api:" + this.apiKey),
        },
        body: subscription,
      }
    );

    if (confirmSubscriptionRequest.status !== 200) {
      throw new Error(
        `Could not subscribe ${email} to list ${this.mailingList} (${confirmSubscriptionRequest.status})`
      );
    }
  }

  // Send a link for new members to confirm their subscription
  async sendConfirmationEmail(email, confirmationUrl) {
    // TODO Don't use my name in these email, make it a parameter
    const message = new FormData();
    message.set("from", `Nicholas <noreply@${this.domain}>`);
    message.set("to", email);
    message.set("subject", "Confirm your newsletter subscription");
    message.set(
      "text",
      `
Your email has been added to my newsletter mailing list.
To start receiving emails, you'll need to confirm your subscription.
Subscribe to my newsletter. (${confirmationUrl}) 
Cheers, Nicholas (https://nicholas.cloud/)
    `
    );
    message.set(
      "html",
      `
<p>
Your email has been added to my newsletter mailing list.<br>
To start receiving emails, you'll need to confirm your subscription.<br>
<a href="${confirmationUrl}">Subscribe to my newsletter.</a><br>
Cheers, <a href="https://nicholas.cloud/">Nicholas</a>
</p>
    `
    );
    const sendMessageRequest = await fetch(
      `https://api.eu.mailgun.net/v3/${this.domain}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: "Basic " + btoa("api:" + this.apiKey),
        },
        body: message,
      }
    );

    if (sendMessageRequest.status !== 200) {
      throw new Error(
        `Could not send confirmation email to ${email} (${sendMessageRequest.status})`
      );
    }
  }

  // Use as a fallback if something goes wrong when adding mailing list members
  async deleteMemberFromMailingList(email) {
    const deleteMemberRequest = await fetch(
      `https://api.eu.mailgun.net/v3/lists/${this.mailingList}/members/${email}`,
      {
        method: "DELETE",
        headers: {
          Authorization: "Basic " + btoa("api:" + MAILGUN_API_KEY),
        },
      }
    );

    if (deleteMemberRequest.status !== 200) {
      throw new Error(
        `Could not delete ${email} from list ${this.mailingList} (${deleteMemberRequest.status})`
      );
    }
  }
}

class EmailSignatures {
  /**
   * Handles the signing/verification of emails to confirmation subscriptions
   * @param {string} signingSecret The sequence of bytes used for signing emails
   */
  constructor(signingSecret) {
    this.signingSecret = signingSecret;
  }

  async getSigningKey() {
    return await crypto.subtle.importKey(
      "raw",
      new Uint8Array(this.signingSecret.split(",").map((n) => parseInt(n, 16))),
      { name: "HMAC", hash: "SHA-256" },
      true,
      ["sign", "verify"]
    );
  }

  async generateSignatureForEmail(email) {
    const key = await this.getSigningKey();
    const sigBuffer = await crypto.subtle.sign(
      "HMAC",
      key,
      new TextEncoder().encode(email)
    );

    return Array.from(new Uint8Array(sigBuffer))
      .map((n) => n.toString(16).padStart(2, "0"))
      .join("");
  }

  async checkEmailMatchesSignature(email, sig) {
    const key = await this.getSigningKey();
    let bytes = [];
    for (let i = 0; i < sig.length; i = i + 2) {
      bytes.push(parseInt(sig.slice(i, i + 2), 16));
    }
    const sigBuffer = new Uint8Array(bytes);

    return await crypto.subtle.verify(
      "HMAC",
      key,
      sigBuffer,
      new TextEncoder().encode(email)
    );
  }
}

const mailgun = new MailgunClient(
  MAILGUN_API_KEY,
  "mailgun.nicholas.cloud",
  "newsletter@mailgun.nicholas.cloud"
);
const signatures = new EmailSignatures(EMAIL_SIGNING_SECRET);

addEventListener("fetch", (event) => {
  event.respondWith(handleRequest(event));
});

async function handleRequest(event) {
  const path = new URL(event.request.url).pathname;
  const method = event.request.method;
  try {
    if (method === "GET" && path === "/newsletter/subscribe/") {
      return await showRegistrationForm(event);
    } else if (method === "POST" && path === "/newsletter/subscribe/") {
      return await acceptRegistration(event);
    } else if (path === "/newsletter/subscribe/confirm") {
      return await confirmRegistration(event);
    } else if (path === "/newsletter/subscribe") {
      return new Response("", {
        status: 302,
        headers: { Location: "https://nicholas.cloud/newsletter/subscribe/" },
      });
    }
    return new Response("Not found\n", { status: 404 });
  } catch (error) {
    console.error(error); // TODO Do some proper logging/alerting with Sentry
    return new Response("Error\n", { status: 500 }); // Ironic, given serverless
  }
}

async function showRegistrationForm() {
  const baseCommand =
    "curl https://nicholas.cloud/newsletter/subscribe/ --data-urlencode email=";
  return new Response(
    `
<!DOCTYPE html>
<html lang="en">
<head>
    <title>Subscribe to my newsletter!</title>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
<style>
main {
    color: #333;
    margin: 0 auto;
    max-width: 600px;
    font-family: monospace;
    text-align: center;
}

code {
    display: block;
    padding: 8px;
    background-color: #333;
    color: #fff;
}

.clickable, input {
    margin: 8px;
    background-color: #fff;
    font-size: 1rem;
    font-family: monospace;
    padding: 8px;
    border: 2px solid #333;
}
</style>
</head>
<body>
<main>
    <h1>Subscribe to my newsletter!</h1>
    <p>I use my newsletter to share interesting pieces and content I love.</p>
    <p>If you subscribe, I'll email you new issues as I publish them.</p>
    <br/>
    <p>I'll only use your email address to deliver this newsletter, and you can unsubscribe at any time.</p>
    <br/>
    <form method="post">
    <label>
        Email
        <input id="email-input" name="email" type="email"></input>
    </label>
    <input class="clickable" type="submit" value="Submit">
    </form>
    <br/>
    <p>Alternatively, you can subscribe from the comfort of your terminal!</p>
    <p><code id="command">${baseCommand}</code></p>
    <button class="clickable" onclick="copyCommandToClipboard()">Click to copy</button>
</main>
<script>
    let command = document.getElementById("command");

    document.getElementById("email-input").oninput = updateCommandWithEmail;

    function copyCommandToClipboard() {
        navigator.clipboard.writeText(command.innerText);
    }

    function updateCommandWithEmail(event) {
        command.innerText = "${baseCommand}" + event.target.value;
    }
</script>
</body>
</html>
`,
    {
      headers: {
        "Content-Type": "text/html",
      },
      status: 200,
    }
  );
}

/**
 * Sign the provided email up for the registration form, but do not subscribe
 * them. A follow-up confirmation is needed to be subscribed.
 */
async function acceptRegistration(event) {
  const email = (await event.request.formData()).get("email");
  if (!email) {
    return new Response("Invalid email\n", { status: 400 });
  }

  await mailgun.addMemberToMailingList(email);

  // Send a confirmation email with a signature of the given address
  const sig = await signatures.generateSignatureForEmail(email);
  const confirmationUrl = `https://nicholas.cloud/newsletter/subscribe/confirm?email=${encodeURIComponent(
    email
  )}&sig=${sig}`; // TODO Make this confirmation URL use parameters

  // Try to send a confirmation email. If the email is not accepted, clean up
  // the unsubscribed member if possible.
  try {
    await mailgun.sendConfirmationEmail(email, confirmationUrl);
  } catch (error) {
    await mailgun.deleteMemberFromMailingList(email);
    throw error; // something still went wrong, so we want to log it
  }

  return new Response(
    "Please check your inbox, a confirmation email is on its way!\n",
    {
      status: 200,
    }
  );
}

/**
 * Confirm a reader's enrolment to my mailing list. The signature must match
 * the email.
 */
async function confirmRegistration(event) {
  const sig = new URL(event.request.url).searchParams.get("sig");
  const email = new URL(event.request.url).searchParams.get("email");
  if (!sig || !email) {
    return new Response("Invalid confirmation link\n", { status: 400 });
  }

  const signed = await signatures.checkEmailMatchesSignature(email, sig);

  if (!signed) {
    return new Response("Invalid confirmation link\n", { status: 400 });
  }

  await mailgun.setMailingListMemberAsSubscribed(email);

  return new Response(
    "Subscription confirmed, you will now receive newsletters!\n",
    { status: 200 }
  );
}
