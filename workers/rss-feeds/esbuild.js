require("esbuild")
  .build({
    entryPoints: ["index.js"],
    bundle: true,
    external: ["fs"],
    outfile: "build/worker.js",
    logLevel: "warning",
    plugins: [require("@nchlswhttkr/esbuild-plugin-handlebars")],
  })
  .catch(() => {
    process.exit(1); // eslint-disable-line no-undef
  });
