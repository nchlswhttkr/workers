let Handlebars = require("handlebars");
let fs = require("node:fs/promises");

module.exports = {
  name: "handlebars",

  setup(build) {
    build.onResolve({ filter: /\.hbs$/ }, (args) => ({
      path: args.path,
      namespace: "handlebars-ns",
    }));

    build.onLoad({ filter: /.*/, namespace: "handlebars-ns" }, async (args) => {
      const template = await fs.readFile(args.path);
      const compiled = Handlebars.precompile(template.toString());
      return {
        contents: `module.exports = ${compiled}`,
        loader: "js",
      };
    });
  },
};
