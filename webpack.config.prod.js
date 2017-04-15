
const path = require('path')
const webpack = require('webpack')

module.exports = {
  devtool: 'source-map',

  entry: [
    './public/reactex.js'
  ],

  output: {
    path: path.join(__dirname, '/dist'),
    filename: 'reactex.js'
  },

  plugins: [
    new webpack.optimize.DedupePlugin(),
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify('production')
      }
    })
  ],

  module: {
    loaders: [
      { test: /\.js?$/,
        loader: 'babel-loader',
        exclude: /node_modules/ }
    ]
  }
}
