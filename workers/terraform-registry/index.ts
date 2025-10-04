import { withTelemetry } from "@nchlswhttkr/cloudflare-workers-otel";
import { env } from "cloudflare:workers";

/**
 * A dependency of boom/call, hoek, references Node's Buffer API. Cloudflare
 * rejects workers whose code references this unavailable API. Declaring a falsy
 * value via an implicit global gets around this behaviour.
 */
Buffer = undefined;
import Boom from "@hapi/boom";
import Call from "@hapi/call";

const router = new Call.Router();
router.add(
  {
    method: "get",
    path: "/terraform-registry/providers/v1/{namespace}/{type}/versions",
  },
  "list-versions",
);
router.add(
  {
    method: "get",
    path: "/terraform-registry/providers/v1/{namespace}/{type}/{version}/download/{os}/{arch}",
  },
  "get-package",
);
router.add(
  {
    method: "get",
    path: "/.well-known/terraform.json",
  },
  "service-discovery",
);

export default withTelemetry("terraform-registry", {
  async fetch(request) {
    try {
      const match = router.route(
        request.method.toLowerCase(),
        new URL(request.url).pathname,
      );

      if (match.route === "list-versions") {
        return await listVersions(match.params);
      } else if (match.route === "get-package") {
        return await getPackage(match.params);
      } else if (match.route === "service-discovery") {
        return new Response(
          JSON.stringify({
            "providers.v1": "/terraform-registry/providers/v1/",
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        );
      }

      throw Boom.notFound();
    } catch (error) {
      if (error.isBoom) {
        console.error(error.message);
        return new Response(error.output.payload.error, {
          status: error.output.payload.statusCode,
        });
      }
      console.error(error);
      return new Response("Internal Server Error", { status: 500 });
    }
  },
});

async function listVersions({ namespace, type }) {
  if (namespace !== "nchlswhttkr") {
    throw Boom.notFound();
  }

  // TODO: Handle pagination when there are many releases
  const releases: any = await fetch(
    `https://api.github.com/repos/nchlswhttkr/terraform-provider-${type}/releases`,
    { headers: { "User-Agent": "@nchlswhttkr workers/terraform-registry" } },
  ).then((response) => {
    if (response.status !== 200) {
      throw Boom.internal(
        `Received ${response.status} while fetching releases from GitHub`,
      );
    }
    return response.json();
  });

  return new Response(
    JSON.stringify({
      versions: releases.map((release) => ({
        version: release.tag_name.substring(1), // trim 'v' from version
      })),
    }),
    { status: 200, headers: { "Content-Type": "application/json" } },
  );
}

// TODO: Consider parallelising these file requests with Promise.all()
async function getPackage({ namespace, type, version, os, arch }) {
  if (namespace !== "nchlswhttkr") {
    throw Boom.notFound();
  }

  const gpgPublicKey = await fetch(
    `https://nicholas.cloud/files/keys/${env.GPG_KEY_ID}.asc`,
  ).then((response) => {
    if (response.status !== 200) {
      throw Boom.internal(`Received ${response.status} while fetching GPG key`);
    }
    return response.text();
  });

  const downloadHash = await fetch(
    `https://github.com/nchlswhttkr/terraform-provider-${type}/releases/download/v${version}/terraform-provider-${type}_${version}_${os}_${arch}.zip`,
  )
    .then((response) => {
      if (response.status !== 200) {
        throw Boom.internal(
          `Received ${response.status} while fetching zipped package`,
        );
      }
      return response.arrayBuffer();
    })
    .then((arrayBuffer) => {
      return crypto.subtle.digest("SHA-256", arrayBuffer);
    })
    .then((arrayBuffer) =>
      Array.from(new Uint8Array(arrayBuffer))
        .map((n) => n.toString(16).padStart(2, "0"))
        .join(""),
    );

  return new Response(
    JSON.stringify({
      protocols: ["5.2"], // so long as provider is built on V2 SDK
      os,
      arch,
      filename: `terraform-provider-${type}_${version}_${os}_${arch}.zip`,
      download_url: `https://github.com/nchlswhttkr/terraform-provider-${type}/releases/download/v${version}/terraform-provider-${type}_${version}_${os}_${arch}.zip`,
      shasums_url: `https://github.com/nchlswhttkr/terraform-provider-${type}/releases/download/v${version}/terraform-provider-${type}_${version}_SHA256SUMS`,
      shasums_signature_url: `https://github.com/nchlswhttkr/terraform-provider-${type}/releases/download/v${version}/terraform-provider-${type}_${version}_SHA256SUMS.sig`,
      shasum: downloadHash,
      signing_keys: {
        gpg_public_keys: [
          {
            key_id: env.GPG_KEY_ID,
            ascii_armor: gpgPublicKey,
          },
        ],
      },
    }),
    { status: 200, headers: { "Content-Type": "application/json" } },
  );
}
