const path = require("path");

module.exports = {
    mode: "development:",
    entry: "./frontend/src/index.js",
    output : {
        path: path.resolve(__dirname, "frontend/public"),
        filename: "bundle.js"
    },
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader"
                }
            }
        ]
    },
    resolve: {
        extensions: [".js"]
    }
};