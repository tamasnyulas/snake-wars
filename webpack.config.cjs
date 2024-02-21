const path = require('path');


// TODO: convert it to be a module instead of a commonjs file
module.exports = {
  entry: {
    game: './src/client/game.entry.js',
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'public/js'),
  },
  mode: 'development',
  devtool: process.env.NODE_ENV === 'development' ? 'eval-source-map' : 'source-map',
};