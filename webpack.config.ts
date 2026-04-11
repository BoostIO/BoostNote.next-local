import path from 'path'
import webpack from 'webpack'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import CopyPlugin from 'copy-webpack-plugin'

import packageJson from './package.json'

module.exports = (_: any, argv: any) => {
  const config: any = {
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
      // default
      // new webpack.NamedModulesPlugin(),
      // prints more readable module names in the browser console on HMR updates

      // new webpack.NoEmitOnErrorsPlugin(),
      // do not emit compiled assets that include errors
      new HtmlWebpackPlugin({
        template: 'index.html',
      }),
      new webpack.ProvidePlugin({
        Buffer: ['buffer', 'Buffer'],
        process: require.resolve('process/browser.js'),
      }),
      new webpack.DefinePlugin({
        'process.env.VERSION': JSON.stringify(packageJson.version),
      }),
      new webpack.EnvironmentPlugin(['NODE_ENV']),
      new CopyPlugin({
        patterns: [
          {
            from: path.join(
              __dirname,
              'node_modules/codemirror/lib/codemirror.css'
            ),
            to: 'app/codemirror/theme/codemirror.css',
          },
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
      client: {
        overlay: true,
      },
      static: [
        {
          directory: path.join(__dirname, 'static'),
          publicPath: '/app/static',
        },
        {
          directory: path.join(__dirname, 'node_modules/codemirror/mode'),
          publicPath: '/app/codemirror/mode',
        },
        {
          directory: path.join(__dirname, 'node_modules/codemirror/addon'),
          publicPath: '/app/codemirror/addon',
        },
        {
          directory: path.join(__dirname, 'node_modules/codemirror/theme'),
          publicPath: '/app/codemirror/theme',
        },
        {
          directory: path.join(__dirname, 'node_modules/katex/dist'),
          publicPath: '/app/katex',
        },
        {
          directory: path.join(
            __dirname,
            'node_modules/remark-admonitions/styles'
          ),
          publicPath: '/app/remark-admonitions',
        },
        { directory: path.join(__dirname, 'public') }, // or __dirname if needed
      ],

      historyApiFallback: {
        index: '/app',
      },

      hot: true,
    },

    resolve: {
      fallback: {
        path: require.resolve('path-browserify'),
        crypto: require.resolve('crypto-browserify'),
        stream: require.resolve('stream-browserify'),
        fs: false,
        buffer: require.resolve('buffer'),
        vm: require.resolve('vm-browserify'),
        process: require.resolve('process/browser'),
      },
      extensions: ['.tsx', '.ts', '.js'],
    },
  }

  if (argv.mode === 'development') {
    // auto applied in 'hot' mode
    // config.plugins.unshift(new webpack.HotModuleReplacementPlugin())

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
