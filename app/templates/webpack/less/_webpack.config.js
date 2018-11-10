const path = require('path');

/* Used to generate html file from template */
const HtmlWebpackPlugin = require('html-webpack-plugin')

/* Used to minify the css after it has been written to its output file */
const OptimizeCssAssetsPlugin = require("optimize-css-assets-webpack-plugin");

const nano = require("cssnano");

/* Used to inline above the fold CSS */
const HtmlCriticalWebpackPlugin = require("html-critical-webpack-plugin");

/* Used to uglify bundle.js */
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

const WebpackBar = require('webpackbar');

module.exports = {
    devtool: "source-map", // Enables source maps for both JS(X) and (S)CSS

    entry: {
        main: "./src/main/index.jsx", // Entry point of where webpack should start from
    },
    output: {
        // output build file to /public folder and call the file bundle.js
        path: __dirname + "/public",
        filename: "[name].js"
    },
    module: {
        rules: [
            // lint all jsx files and then run babel on them before bundling
            {
                test: /\.jsx$/,
                exclude: /node_modules/,
                use: ["babel-loader", "eslint-loader"],
            },

            // use less-loader, css-loader, and style-loader for all scss files
            // less-loader - converts scss to css
            // css-loader - allows for using import or require statements in the jsx
            // style-loader - injects the css into the browser in a style tag
            {
				test: /\.less$/,
				use: ["style-loader", "css-loader", "less-loader"]
			},

            {
                test: /\.css$/,
                use: ["style-loader", "css-loader"]
            }
        ]
    },
    mode: process.env.NODE_ENV || 'development',

    resolve: {
        extensions: ['*', '.js', 'jsx', '.css', '.less']
    },

    devServer: {
        contentBase: path.join(__dirname, './public'),
        proxy: {
            "/api": "http://localhost:3000"
        }
    },

    plugins: [
        new HtmlWebpackPlugin({
            base: './public/',
            template: 'HTMLTemplate.js',
            dest: 'index.html',
            inject: false,
            title: 'React Stack V2'
        }),

        // Optimizes css by minifying it and removing comments
        new OptimizeCssAssetsPlugin({
            cssProcessor: nano,
            cssProcessorOptions: {discardComments: {removeAll: true} },
            canPrint: true
        }),

        // Uglify JS
        new UglifyJsPlugin(),

        new WebpackBar()
    ]
}
