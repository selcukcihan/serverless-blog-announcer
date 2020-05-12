const slsw = require('serverless-webpack')
const path = require('path')
const nodeExternals = require('webpack-node-externals')

module.exports = {
  entry: slsw.lib.entries,
  target: 'node',
  devtool: 'source-map',
  output: {
    libraryTarget: 'commonjs',
    path: path.resolve(__dirname, 'output'),
    filename: '[name].js',
  },
  mode: 'development',
  externals: [
    nodeExternals({
      modulesFromFile: true,
    })
  ]
}
