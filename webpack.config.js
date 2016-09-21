let webpack = require('webpack')

var definePlugin = new webpack.DefinePlugin({
  'process.env': {
    IS_BROWSER: true,
  },
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
    ],
  },
  debug: true,
  resolve: {
    root: ['/',],
    modulesDirectories: ['node_modules', 'lib',],
    extensions: ['', '.js',],
  },
  devServer: {
    historyApiFallback: false,
    proxy: {
      '**': 'http://localhost:8000',
    },
  },
  plugins: [definePlugin,],
}
