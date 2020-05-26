require("./polyfill_performance.js");
require("./wasm_exec.js");

addEventListener("fetch", (event) => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  // Create our instance, with an imported function
  const go = new Go();
  go.importObject.env["main.go.sayHello"] = () => {
    console.log("Hello from the imported function!");
  };
  const instance = await WebAssembly.instantiate(WASM, go.importObject);

  // Memory for this instance persists between runs
  go.run(instance); // Hello from TinyGo! Called 1 times so far!
  go.run(instance); // Hello from TinyGo! Called 2 times so far!

  // We can use its exported functions
  console.log(instance.exports.multiply(2, 2)); // 4
  console.log(instance.exports.multiply(3, 4)); // 12

  // Our Golang has access to the imported function
  instance.exports.runSayHello(); // Hello from the imported function!

  // Take query params to the worker and show a result
  let a = Number(new URL(request.url).searchParams.get("a"));
  let b = Number(new URL(request.url).searchParams.get("b"));
  if (Number.isNaN(a) || Number.isNaN(b)) {
    return new Response("Make sure a and b are numbers\n", { status: 400 });
  }
  const product = instance.exports.multiply(a, b);
  return new Response(`${a} x ${b} = ${product}\n`, { status: 200 });
}
