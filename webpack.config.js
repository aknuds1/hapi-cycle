let webpack = require('webpack')

var definePlugin = new webpack.DefinePlugin({
  __IS_BROWSER__: true,
})

module.exports = {
  context: __dirname + '/app',
  entry: [
    'babel-polyfill',
    './entry.js',
  ],
  output: {
    path: __dirname + '/dist',
    filename: 'bundle.js',
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        loader: 'babel',
      },
      {
        test: /\.styl$/,
        loader: 'style-loader!raw!stylus-loader',
      },
      {
        test: /\.css$/,
        loader: 'style-loader!css-loader',
      },
      {
        test: /\.(eot|woff|woff2|ttf|svg)($|\?)/,
        loader: 'url-loader?limit=30000&name=[name]-[hash].[ext]',
      },
      {
        test: /\.json$/,
        loader: 'json-loader',
      },
      {
        test: /\.scss$/,
        loader: 'style!css!sass',
        exclude: /node_modules/,
      },
    ],
  },
  debug: true,
  devtool: 'cheap-module-eval-source-map',
  resolve: {
    root: ['/',],
    modulesDirectories: ['node_modules', 'lib',],
    extensions: ['', '.js',],
  },
  devServer: {
    historyApiFallback: false,
    proxy: {
      '*': 'http://localhost:8000',
    },
  },
  plugins: [definePlugin,],
}
