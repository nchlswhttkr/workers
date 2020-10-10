module.exports = {
  entry: __dirname + "/index.js",
  mode: process.env.NODE_ENV || "none",
  module: {
    // The imports Go requires as WASM are designed for cross-platform use,
    // so parsing the file will throw errors when bundling for web use.
    noParse: /(wasm_exec|polyfill_performance)\.js/,
  },
};
