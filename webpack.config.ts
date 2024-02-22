const path = require('path');

// TODO: convert it to be a module instead of a commonjs file
module.exports = {
  entry: {
    game_client: './src/Infrastructure/Web/game_client.entry.ts',
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'public/js'),
  },
  resolve: {
    extensions: ['.ts', '.js'],
    alias: {
      '@app': path.resolve(__dirname, 'src/Application'),
      '@domain': path.resolve(__dirname, 'src/Domain'),
      '@infra': path.resolve(__dirname, 'src/Infrastructure'),
    },
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  mode: 'development',
  devtool: process.env.NODE_ENV === 'development' ? 'eval-source-map' : 'source-map',
};