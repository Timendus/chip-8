const path = require('path');

module.exports = {
  mode: 'development',

  entry: {
    'index': './emulator/index.js'
  },

	output: {
		path: path.join(__dirname, 'docs'),
		filename: '[name].js'
	},

	watch: true,
  watchOptions: {
    ignored: [
      '/node_modules/'
    ]
  },

  devServer: {
    contentBase: path.join(__dirname, 'docs')
  }
};
