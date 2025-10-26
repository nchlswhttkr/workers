import svelte from "rollup-plugin-svelte";
// import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import terser from "@rollup/plugin-terser";
import css from "rollup-plugin-css-only";
import image from "@rollup/plugin-image";

const production = process.env.NODE_ENV === "production";

export default {
  input: "src/main.js",
  output: {
    format: "iife",
    name: "app",
    file: "build/bundle.js",
  },
  plugins: [
    svelte({
      compilerOptions: {
        // enable run-time checks when not in production
        dev: !production,
      },
    }),
    // we'll extract any component CSS out into
    // a separate file - better for performance
    css({ output: "bundle.css" }),

    // If you have external dependencies installed from
    // npm, you'll most likely need these plugins. In
    // some cases you'll need additional configuration -
    // consult the documentation for details:
    // https://github.com/rollup/plugins/tree/master/packages/commonjs
    resolve({
      browser: true,
      dedupe: ["svelte"],
    }),
    // commonjs(),

    // If we're building for production (npm run build
    // instead of npm run dev), minify
    production && terser(),

    image({ exclude: "**/*.svg" }),

    // Custom transformer to convert SVGs into strings for injecting
    {
      name: "transform-svg-to-string",
      transform: (code, id) => {
        if (id.endsWith(".svg")) {
          return {
            code: `export default ${JSON.stringify(code)}`,
            mappings: "",
          };
        }
      },
    },
  ],
};
