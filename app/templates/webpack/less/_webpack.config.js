const path = require('path');
const webpack = require('webpack');
const dotenv = require('dotenv');
const nano = require("cssnano");
const WebpackBar = require('webpackbar');
const HtmlWebpackPlugin = require('html-webpack-plugin')
const OptimizeCssAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const glob = require("glob");

const serverFiles = ( () => {

    const tsFiles = new glob('./server/**/*.ts', { sync: true } );
    const entry = {};

    tsFiles.forEach(file => {
        const key = file.slice(0, -3);
        entry[key] = file;
    });

    return entry;

})();

const env = dotenv.config().parsed;
const envKeys = Object.keys(env).reduce((prev, next) => {
	prev[`process.env.${next}`] = JSON.stringify(env[next]);
	return prev;
}, {});

const port = envKeys['process.env.PORT'];

const serverConfig = {
	devtool: 'source-map',
	target: 'node',
	entry: serverFiles,
	output: {
		path: __dirname + '/public',
		filename: '[name].js',
		publicPath: '/'
	},
	module: {

		rules: [
			{
				test: /\.ts$/,
				exclude: /node_modules/,
				use: ['awesome-typescript-loader']
			}
		]
	},

	mode: process.env.NODE_ENV || 'development',

	resolve: {
		extensions: ['.ts', '.js', '.json']
	},

	plugins: [

		new webpack.DefinePlugin(envKeys)

	]
}

const clientConfig = {
	entry: {
		main: "./src/index.jsx", // Entry point of where webpack should start from
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
				use: ["style-loader", "css-loader", "postcss-loader", "less-loader"]
			},

			{
				test: /\.css$/,
				use: ["style-loader", "css-loader", "postcss-loader"]
			}
		]
	},

	mode: process.env.NODE_ENV || 'development',

	resolve: {
		extensions: ['*', '.js', 'jsx', '.css', '.less']
	},

	devServer: {
		historyApiFallback: true,
		contentBase: path.join(__dirname, './public'),
		proxy: {
			"/api": `http://localhost:${port}`
		}
	},

	plugins: [
		new HtmlWebpackPlugin({
			base: './public/',
			template: 'HTMLTemplate.js',
			dest: 'index.html',
			inject: false,
			title: 'Premiere Mern Stack'
		}),

		// Optimizes css by minifying it and removing comments
		new OptimizeCssAssetsPlugin({
			cssProcessor: nano,
			cssProcessorOptions: {discardComments: {removeAll: true} },
			canPrint: true
		}),

		new WebpackBar(),

		new webpack.DefinePlugin(envKeys)
	]
}

module.exports = [serverConfig, clientConfig];
