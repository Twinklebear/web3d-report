const HtmlWebpackPlugin = require("html-webpack-plugin");
const path = require("path");

module.exports = {
    entry: "./src/web3d_report.js",
    mode: "development",
    devServer: {
        headers: [
            {
                "key": "Cross-Origin-Embedder-Policy",
                "value": "require-corp"
            },
            {
                "key": "Cross-Origin-Opener-Policy",
                "value": "same-origin"
            }
        ]
    },
    output: {
        filename: "main.js",
        path: path.resolve(__dirname, "dist"),
    },
    plugins: [new HtmlWebpackPlugin({
        template: "./index.html",
    })],
};

