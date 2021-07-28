import path from 'path'
import webpack from 'webpack'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import express from 'express'
import ErrorOverlayPlugin from 'error-overlay-webpack-plugin'
import CopyPlugin from 'copy-webpack-plugin'
import packageJson from './package.json'

module.exports = (env, argv) => {
  const config: webpack.Configuration = {
    entry: ['./src/index.tsx'],

    output: {
      filename: 'bundle.js',
      path: path.resolve(__dirname, 'compiled'),
    },

    devtool: 'inline-source-map',

    module: {
      rules: [
        {
          test: /\.css$/i,
          use: ['style-loader', 'css-loader'],
        },
        {
          test: /\.(png|jpe?g|gif|svg|eot|ttf|woff|woff2)$/i,
          loader: 'url-loader',
          options: {
            limit: 8192,
          },
        },
        {
          test: /\.tsx?$/,
          use: [{ loader: 'ts-loader', options: { transpileOnly: true } }],
          exclude: /node_modules/,
        },
        {
          test: /\.md$/,
          use: [
            {
              loader: 'raw-loader',
            },
          ],
        },
      ],
    },

    plugins: [
      new webpack.NamedModulesPlugin(),
      // prints more readable module names in the browser console on HMR updates

      new webpack.NoEmitOnErrorsPlugin(),
      // do not emit compiled assets that include errors
      new HtmlWebpackPlugin({
        template: 'index.html',
      }),
      new ErrorOverlayPlugin(),
      new webpack.DefinePlugin({
        'process.env.VERSION': JSON.stringify(packageJson.version),
      }),
      new webpack.EnvironmentPlugin(['NODE_ENV']),
      new CopyPlugin({
        patterns: [
          {
            from: path.join(__dirname, 'node_modules/codemirror/theme'),
            to: 'app/codemirror/theme',
          },
          {
            from: path.join(__dirname, 'static'),
            to: 'app/static',
          },
          {
            from: path.join(__dirname, 'node_modules/katex/dist/katex.min.css'),
            to: 'app/katex/katex.min.css',
          },
          {
            from: path.join(__dirname, 'node_modules/katex/dist/fonts/'),
            to: 'app/katex/fonts/',
          },
          {
            from: path.join(
              __dirname,
              'node_modules/remark-admonitions/styles/classic.css'
            ),
            to: 'app/remark-admonitions/classic.css',
          },
        ],
      }),
    ],

    devServer: {
      host: 'localhost',
      port: 3000,

      historyApiFallback: {
        index: '/app',
      },
      // respond to 404s with index.html

      hot: true,
      // enable HMR on the server

      before: function (app, server) {
        app.use(
          '/app/codemirror/mode',
          express.static(path.join(__dirname, 'node_modules/codemirror/mode'))
        )
        app.use(
          '/app/codemirror/addon',
          express.static(path.join(__dirname, 'node_modules/codemirror/addon'))
        )
        app.use(
          '/app/codemirror/theme',
          express.static(path.join(__dirname, 'node_modules/codemirror/theme'))
        )
        app.use(
          '/app/katex/katex.min.css',
          express.static(
            path.join(__dirname, 'node_modules/katex/dist/katex.min.css')
          )
        )
        app.use(
          '/app/remark-admonitions/classic.css',
          express.static(
            path.join(
              __dirname,
              'node_modules/remark-admonitions/styles/classic.css'
            )
          )
        )
        app.use('/app/static', express.static(path.join(__dirname, 'static')))
      },
    },

    resolve: {
      extensions: ['.tsx', '.ts', '.js'],
    },
    node: {
      fs: 'empty',
    },
  }

  if (argv.mode === 'development') {
    config.plugins.unshift(new webpack.HotModuleReplacementPlugin())

    config.entry = [
      'react-hot-loader/patch',
      'webpack-dev-server/client?http://localhost:3000',
      'webpack/hot/only-dev-server',
      ...(config.entry as string[]),
    ]
    config.output.publicPath = 'http://localhost:3000/app'
  }

  if (argv.mode === 'production') {
    config.optimization = {
      minimize: true,
    }
    if (process.env.TARGET === 'electron') {
      config.output.path = path.resolve(__dirname, 'electron/compiled')
    } else {
      config.output.publicPath = '/app/'
    }
  }

  return config
}
