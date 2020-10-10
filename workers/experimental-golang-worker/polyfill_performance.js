/**
 * The exec_wasm.js file needed to run Golang WASM assumes the Performance API
 * will be available when executing in a worker/web browser.
 *
 * This is not the case for Cloudflare Workers, so we polyfill the necessary
 * functions. This inability to measure execution time is an intentional
 * decision. See https://developers.cloudflare.com/workers/about/security/
 *
 * https://developer.mozilla.org/en-US/docs/Web/API/Performance
 */

performance = {
  now: Date.now,
};
