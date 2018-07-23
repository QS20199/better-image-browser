const path = require('path');

module.exports = {
	entry: {
		content: './better-image-browser/src/content.ts',
		eventPage: './better-image-browser/src/eventPage.ts',
		popup: './better-image-browser/src/popup.ts',
	},
	module: {
		rules: [{
			test: /\.css$/,
			use: [
				'style-loader',
				'css-loader'
			]
		}, {
			test: /\.(png|svg|jpg|gif|svg)$/,
			use: [
				'url-loader'
			]
		}, {
			test: /\.tsx?$/,
			use: [{
				loader: 'ts-loader'
			}],
			exclude: /node_modules/
		}]
	},
	plugins: [],
	devtool: 'source-map',
	resolve: {
		extensions: ['.tsx', '.ts', '.js']
	},
	output: {
		filename: '[name].js',
		path: path.resolve(__dirname, './better-image-browser/src')
	}
};