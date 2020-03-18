module.exports = {
  entry: __dirname + "/index.js",
  mode: process.env.NODE_ENV || "none",
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "@nchlswhttkr/inject-env-loader"
        }
      }
    ]
  }
};
