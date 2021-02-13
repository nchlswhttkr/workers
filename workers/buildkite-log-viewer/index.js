require("./polyfill_performance.js");
require("./wasm_exec.js");

addEventListener("fetch", (event) => {
  event.respondWith(handleRequest(event));
});

async function handleRequest(event) {
  try {
    // Instantiate WASM
    const go = new Go();
    go.importObject.env["command-line-arguments.sayHello"] = () => {
      console.log("Hello from the imported function!");
    };
    const instance = await WebAssembly.instantiate(WASM, go.importObject);

    // Convert
    const logs = (await event.request.formData()).get("logs");
    if (!logs) {
      throw new Error("No logs supplied");
    }
    const html = instance.exports.convert(event.request.formData(logs));
    return new Response(html, { status: 200 });
  } catch (error) {
    return new Response(error, { status: 500 });
  }
}
