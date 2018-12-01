const path = require('path')
const webpack = require('webpack')

// process.env.NODE_ENV = process.env.NODE_ENV || 'development'
/*
if (process.env.NODE_ENV === 'test') {
    require('dotenv').config({ path: '.env.test' })
} else if (process.env.NODE_ENV === 'development') {
    require('dotenv').config({ path: '.env.development' })
}

require('dotenv').config({ path: '.env.development' })
*/

module.exports = (env) => {
    const isProduction = env === 'production'
    return {
        entry: ["@babel/polyfill", "./src/app.js"],
        output: {
            path: path.join(__dirname, 'public'),
            filename: 'bundle.js'
        },
        module: {
            rules: [{
                loader: 'babel-loader',
                test: /\.js$/,
                exclude: /node_modules/
            },
            {
                test: /\.s?css$/,
                use: [
                    'style-loader',
                    'css-loader',
                    'sass-loader'
                ]
            },
            {
                test: /\.(png|jpg|gif)$/,
                use: [
                  {
                    loader: 'file-loader',
                    options: {}
                  }
                ]
            }]
        },
        plugins: [
            new webpack.DefinePlugin({
                'process.env.CLARIFAI_API_KEY': JSON.stringify(process.env.CLARIFAI_API_KEY)
              })
        ],
        devtool: isProduction ? 'source-map' : 'inline-source-map',
        devServer: {
            contentBase: path.join(__dirname, 'public'),
            historyApiFallback: true
        }
    }
}