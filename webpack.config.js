const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const htmlPlugin = new HtmlWebpackPlugin({
	title: 'calculator',
	template: './public/index.html',
	filename: './index.html'
});

const miniCss = new MiniCssExtractPlugin({
	filename: '[name].css',
	chunkFilename: '[id].css'
});

module.exports = {
	context: path.resolve(__dirname, './'),
	entry: {
		app: ['babel-polyfill', './src/index.jsx']
	},
	output: {
		filename: '[name].js',
		path: path.resolve(__dirname, 'build')
	},
	devServer: {
		contentBase: path.resolve(__dirname, 'public')
	},
	resolve: {
		modules: [__dirname, 'node_modules'],
		extensions: ['.js', '.jsx']
	},
	module: {
		rules: [
			{
				test: /\.jsx?$/,
				exclude: /node_modules/,
				loader: 'babel-loader',
				query: {
					presets: ['@babel/preset-env', '@babel/preset-react']
				}
			},
			{
				test: /\.s?css$/,
				use: [
					process.env.NODE_ENV !== 'production'
						? 'style-loader'
						: MiniCssExtractPlugin.loader,
					'css-loader',
					'sass-loader'
				]
			},
			{
				test: /\.(jpe|jpg|woff|woff2|eot|ttf|svg)(\?.*$|$)/,
				loader: 'file-loader'
			}
		]
	},
	plugins: [htmlPlugin, miniCss]
};