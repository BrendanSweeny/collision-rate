let HtmlWebpackPlugin = require('html-webpack-plugin');
let HtmlWebpackPluginConfig = new HtmlWebpackPlugin({
  template: __dirname + '/public/index.html',
  filename: 'index.html',
  inject: 'body'
});

module.exports = {
  entry: [
    './public/index.js'
  ],
  output: {
    path: __dirname + '/dist',
    filename: "bundle.js"
  },
  module: {
    loaders: [
      {test: /\.js$/, include: __dirname, loader: "babel-loader"},
      {test: /\.css$/, include: __dirname, loader: ["style-loader", "css-loader"]}
    ]
  },
  plugins: [HtmlWebpackPluginConfig]
}
