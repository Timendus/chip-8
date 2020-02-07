const path = require('path');

module.exports = {
  mode: 'development',

  entry: {
    'index': './src/application/index.js'
  },

	output: {
		path: path.join(__dirname, 'docs'),
		filename: '[name].js'
	},

  watchOptions: {
    ignored: [
      '/node_modules/'
    ]
  },

  devServer: {
    contentBase: path.join(__dirname, 'docs')
  }
};
