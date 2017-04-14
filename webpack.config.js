let HtmlWebpackPlugin = require('html-webpack-plugin');
let HtmlWebpackPluginConfig = new HtmlWebpackPlugin({
  template: __dirname + '/public/index.html',
  filename: 'index.html',
  inject: 'body'
});

module.exports = {
  entry: [
    './public/scripts.js'
  ],
  output: {
    path: __dirname + '/dist',
    filename: "scripts.js"
  },
  module: {
    loaders: [
      {test: /\.js$/, include: __dirname, loader: "babel-loader"}
    ]
  },
  plugins: [HtmlWebpackPluginConfig]
}
