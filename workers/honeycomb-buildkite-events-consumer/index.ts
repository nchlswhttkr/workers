declare const CF_VERSION_METADATA: any;

addEventListener("fetch", (event) => {
  event.respondWith(handleRequest(event));
});

async function handleRequest(event: FetchEvent) {
  try {
    // TODO HMAC verification, copy Belles worker calls to Up

    if (event.request.method != "POST") {
      return new Response("Not Found", { status: 404 });
    }

    const honeycombToken = new URL(event.request.url).pathname.split("/")[1];

    const buildkiteEvent = await event.request.json<any>();

    let span;
    console.log(`Event ${buildkiteEvent.event} received`);
    switch (buildkiteEvent.event) {
      case "build.finished":
        span = generateSpanFromBuild(buildkiteEvent);
        break;
      case "job.finished":
        span = generateSpanFromJob(buildkiteEvent);
        break;
      default:
        throw new Error(`Unexpected event type ${buildkiteEvent.event}`);
    }

    // https://github.com/open-telemetry/opentelemetry-proto/blob/v1.5.0/examples/trace.json
    const payload = {
      resourceSpans: [
        {
          resource: {
            attributes: [
              {
                key: "service.name",
                value: {
                  stringValue: "buildkite",
                },
              },
            ],
          },
          scopeSpans: [
            {
              scope: {
                name: "@nchlswhttkr/honeycomb-buildkite-events-consumer",
                version: CF_VERSION_METADATA.id,
              },
              spans: [span],
            },
          ],
        },
      ],
    };

    return fetch("https://api.honeycomb.io:4318/v1/traces", {
      method: "POST",
      body: JSON.stringify(payload),
      headers: {
        "X-Honeycomb-Team": honeycombToken,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    return new Response(error, { status: 500 });
  }
}

function generateSpanFromBuild({ build, pipeline }) {
  return {
    traceId: build.id.replace(/-/g, ""),
    spanId: build.id.replace(/-/g, "").slice(0, 16),
    name: pipeline.slug,
    startTimeUnixNano: Number(new Date(build.started_at)) * 1000000, // TODO: Investigate why Honeycomb accepts timestamps in microseconds not nanoseconds
    endTimeUnixNano: Number(new Date(build.finished_at)) * 1000000,
    kind: 1, // SPAN_KIND_INTERNAL
  };
}

function generateSpanFromJob({ build, job }) {
  return {
    traceId: build.id.replace(/-/g, ""),
    spanId: job.id.replace(/-/g, "").slice(0, 16),
    parentSpanId: build.id.replace(/-/g, "").slice(0, 16),
    name: job.name,
    startTimeUnixNano: Number(new Date(job.started_at)) * 1000000,
    endTimeUnixNano: Number(new Date(job.finished_at)) * 1000000,
    kind: 1, // SPAN_KIND_INTERNAL
  };
}
