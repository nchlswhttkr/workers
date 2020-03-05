require("./polyfill_performance.js");
require("./wasm_exec.js");

addEventListener("fetch", event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  console.log("Hello from our worker script!");

  // Create our instance, with an imported function
  const go = new Go();
  go.importObject.env["main.go.sayHello"] = () => {
    console.log("Hello from the imported function!");
  };
  const result = await WebAssembly.instantiate(WASM, go.importObject);

  // We can run this instance multiple times
  go.run(result); // Hello from TinyGo!
  go.run(result); // Hello from TinyGo!

  // We can use its exported functions
  console.log(result.exports.multiply(1, 1)); // 1
  console.log(result.exports.multiply(2, 2)); // 4
  console.log(result.exports.multiply(3, 4)); // 12

  // Our Golang has access to the imported function
  result.exports.runSayHello(); // Hello from the imported function!

  return new Response("", { status: 200 });
}
