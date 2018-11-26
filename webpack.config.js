module.exports = {
  entry: './scripts/index.js',
  output: {
		path: __dirname + '/dist',
    filename: 'bundle.js'
	},
	watch: true,
	watchOptions: {
		aggregateTimeout: 100
	},

	devtool: "source-map"
};