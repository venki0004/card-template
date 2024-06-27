const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyPlugin = require('copy-webpack-plugin')
const webpack = require("webpack");
const dotenv = require("dotenv");
dotenv.config();
module.exports = {
    entry: "./src/index.tsx",
    output: {
        path: path.join(__dirname, "build"),
        filename: "index.bundle.js",
    },
    mode: process.env.NODE_ENV || "development",
    resolve: {
        extensions: [".jsx", ".js",'.ts','.tsx'],
    },
    devServer: {
        port: 3000,
        static: {
            directory: path.join(__dirname, "src")
        },
        historyApiFallback: true,
        hot: true,
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: ["babel-loader"],
            },
            {
                test: /\.(ts|tsx)$/,
                exclude: /node_modules/,
                use: ["ts-loader"],
            },
            {
                test: /\.(css|scss)$/,
                use: [
                    "style-loader",
                    "css-loader",
                    "css-modules-typescript-loader",
                    "postcss-loader",
                ],
            },
            {
                test: /\.(jpg|jpeg|png|gif|mp3|svg|ttf|woff|eot|otf)$/,
                use: ["file-loader"],
            },
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: path.join(__dirname, "src", "index.html"),
        }),
        new webpack.DefinePlugin({
            "process.env": JSON.stringify(process.env),
        }),
        new CopyPlugin({
            patterns: [{ from: 'src/assets', to: 'assets' }],
        }),
    ],
};