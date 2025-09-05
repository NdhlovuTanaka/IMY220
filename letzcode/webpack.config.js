const path = require("path");

module.exports = {
  mode: "development",
  entry: "./frontend/src/index.js",
  output: {
    path: path.resolve(__dirname, "frontend/public"),
    filename: "bundle.js"
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader"
          // Remove the options - let .babelrc handle the configuration
        }
      }
    ]
  },
  resolve: { extensions: [".js"] }
};