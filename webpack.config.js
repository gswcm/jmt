const path = require("path");
const merge = require("webpack-merge");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const ProgressPlugin = require("progress-webpack-plugin");
const FriendlyErrorsWebpackPlugin = require("friendly-errors-webpack-plugin");
const webpack = require('webpack');

const parts = require("./webpack.parts");

const PATHS = {
	app: path.join(__dirname, "app"),
	build: path.join(__dirname, "build")
};

const commonConfig = merge([
	{
		entry: {
			app: PATHS.app
		},
		output: {
			path: PATHS.build,
			filename: "[name].js"
		},
		module: {
			loaders: []
		},
		plugins: [
			new HtmlWebpackPlugin({
				inject: false,
				template: require("html-webpack-template-pug"),
				title: "JMT | GSW Junior Math Tournament",
				mobile: true,
				injectExtras: {
					head: [
						{
							tag: "meta",
							name: "descripton",
							content: "GSW Junior Math Tournament"
						},
						{
							tag: "meta",
							name: "keywords",
							content:
								"GSW, math, tournamnet, junior, elementary, JMT, Georgia, registration"
						},
						{
							tag: "meta",
							name: "robots",
							content: "INDEX,FOLLOW"
						}
					],
					body: [
						{
							tag: "noscript",
							innerHTML:
								"JavaScript is disabled in your browser. <a href='http://www.enable-javascript.com/' target='_blank'>Here</a> is how to enable it."
						}
					]
				},
				appMountId: "app"
			}),
			new ProgressPlugin(true),
			new FriendlyErrorsWebpackPlugin(),
			new webpack.NamedModulesPlugin()
		]
	},
	parts.loadFonts({
		options: {
			name: "./fonts/[name].[hash:8].[ext]"
		}
	}),
	parts.loadAssets(),
	parts.loadVue()
]);

const productionConfig = merge([
	parts.setFreeVariable('process.env.NODE_ENV','production'),
	// parts.generateSourceMaps({
	// 	type: "source-map"
	// }),
	parts.cleanup(PATHS.build),
	parts.minifyJavaScript(
		{
			sourceMap: true,
			parallel: true,
		}
	),
	parts.minifyCSS({
		discardComments: {
			removeAll: true
		},
		safe: true
	}),
	parts.extractCSS({
		use: ["css-loader", parts.autoprefix(), "sass-loader"]
	}),
	parts.loadImages({
		options: {
			limit: 2000,
			name: "./images/[name].[hash:8].[ext]"
		}
	}),
	parts.extractBundles([
		{
			name: "vendor",
			minChunks: ({ resource }) => /node_modules/.test(resource)
		},
		{
			name: "manifest",
			minChunks: Infinity
		}
	]),
	// {
	// 	performance: {
	// 		hints: "warning",
	// 		maxAssetSize: 450000
	// 	},
	// },
	{ 
		output: {
			chunkFilename: '[name].[chunkhash:8].js',
			filename: '[name].[chunkhash:8].js',
		}
	}
]);

const developmentConfig = merge([
	{
		output: {
			devtoolModuleFilenameTemplate: "webpack:///[absolute-resource-path]"
		}
	},
	parts.generateSourceMaps({
		type: "cheap-module-eval-source-map"
	}),
	parts.devServer({
		host: process.env.HOST,
		port: process.env.PORT
	}),
	parts.loadCSS(),
	parts.loadImages()
]);

module.exports = env => {
	if (env === "production") {
		return merge(commonConfig, productionConfig);
	}
	return merge(commonConfig, developmentConfig);
};