var webpack = require('webpack');
module.exports = {
  devServer: {
     headers: {
        'X-Frame-Options': 'sameorigin'
    }
  },
  entry: {
    app: './app.js'
  },
  mode: "development",
  devtool: 'source-map',
  output: {
    path: __dirname + '/dist',
    publicPath: '/',
    filename: 'app.js'
  },
  
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        query: {
          cacheDirectory: true,
          presets: ['react', 'es2015']
        }
      }
    ]
  }
}
