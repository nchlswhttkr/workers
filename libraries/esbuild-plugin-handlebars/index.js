import Handlebars from "handlebars";
import fs from "node:fs/promises";
import path from "node:path";

export default {
  name: "handlebars",

  setup(build) {
    build.onResolve({ filter: /\.hbs$/ }, (args) => ({
      path: path.join(args.resolveDir, args.path),
      namespace: "handlebars-ns",
    }));

    build.onLoad({ filter: /.*/, namespace: "handlebars-ns" }, async (args) => {
      const template = await fs.readFile(args.path);
      const compiled = Handlebars.precompile(template.toString());
      return {
        contents: `export default ${compiled}`,
        loader: "js",
      };
    });
  },
};
