require("dotenv").config();

/**
 * A custom loader that replaces certain identifiers with runtime environment
 * variables. To be replaced, identifiers should be prefixed with "ENV_".
 *
 * This includes function identifiers too, which causes TypeErrors, so beware.
 *
 * https://github.com/babel/babel-loader#customized-loader
 */
module.exports = require("babel-loader").custom((babel) => {
  function injectEnvionrmentVariablesPlugin({ types }) {
    return {
      visitor: {
        Identifier(path) {
          if (path.node.name.startsWith("ENV_")) {
            const suffix = path.node.name.slice(4);

            // TODO Skip if identifier is a declaration (eg FunctionDeclaration)

            // Don't assume the environment variable exists!
            if (process.env[suffix] !== undefined) {
              path.replaceWith(types.stringLiteral(process.env[suffix]));
            } else {
              throw new Error(`The environment variable ${suffix} must be set`);
            }
          }
        },
      },
    };
  }

  return {
    config: () => ({ plugins: [injectEnvionrmentVariablesPlugin] }),
  };
});
