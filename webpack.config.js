let HtmlWebpackPlugin = require('html-webpack-plugin');
let HtmlWebpackPluginConfig = new HtmlWebpackPlugin({
  template: __dirname + '/public/index.html',
  filename: 'index.html',
  inject: 'body'
});

module.exports = {
  entry: [
    './public/reactex.js'
  ],
  output: {
    path: __dirname + '/dist',
    filename: "reactex.js"
  },
  module: {
    loaders: [
      {test: /\.js$/, include: __dirname, loader: "babel-loader"}
    ]
  },
  plugins: [HtmlWebpackPluginConfig]
}
