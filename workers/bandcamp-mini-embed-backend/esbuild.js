import * as esbuild from "esbuild";
import handlebarsPlugin from "@nchlswhttkr/esbuild-plugin-handlebars";

await esbuild.build({
  entryPoints: ["src/index.js"],
  bundle: true,
  platform: "node",
  format: "esm",
  external: ["cloudflare:workers"],
  outfile: "build/worker.js",
  logLevel: "warning",
  plugins: [handlebarsPlugin],
});
