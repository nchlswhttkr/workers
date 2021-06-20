# counter

Having some fun with isolate persistence in Cloudflare Workers.

Repeated requests to https://counter.nchlswhttkr.workers.dev will increment the counter, so long as you continue to hit the same node and the isolate is not discarded.
