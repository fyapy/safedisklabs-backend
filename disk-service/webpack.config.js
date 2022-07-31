const { resolve } = require('path')
const Dotenv = require('dotenv-webpack')
const ESLintPlugin = require('eslint-webpack-plugin')
const nodeExternals = require('webpack-node-externals')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin')
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin')
const RunNodeWebpackPlugin = require('run-node-webpack-plugin')

const isProduction = process.env.NODE_ENV === 'production'

/** @type {import('webpack').Configuration} */
module.exports = {
  mode: isProduction ? 'production' : 'development',
  entry: resolve(process.cwd(), 'src/main.ts'),
  output: {
    filename: 'main.js',
    path: resolve(process.cwd(), 'dist'),
  },
  devtool: 'eval-source-map',
  optimization: {
    minimize: isProduction,
  },
  stats: 'normal',
  watch: !isProduction,
  target: 'node',
  externals: [nodeExternals()],
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: {
          loader: 'swc-loader',
          options: {
            sync: true,
            jsc: {
              parser: {
                syntax: 'typescript',
              },
            },
          },
        },
      },
    ],
  },
  resolve: {
    extensions: ['.ts'],
    plugins: [
      new TsconfigPathsPlugin({
        configFile: resolve(process.cwd(), 'tsconfig.json'),
      }),
    ],
  },
  plugins: [
    new Dotenv(),
    new ESLintPlugin({
      extensions: ['ts'],
      emitError: true,
      emitWarning: true,
      failOnWarning: true,
      failOnError: true,
      cache: false,
      fix: false,
    }),
    new CleanWebpackPlugin(),
    new ForkTsCheckerWebpackPlugin(),
    ...(!isProduction
      ? [new RunNodeWebpackPlugin()]
      : []),
  ],
}
