const path = require("path");
const webpack = require('webpack');

module.exports = {
    entry : {
        main: [
            'webpack/hot/dev-server',
            'webpack-hot-middleware/client',
            './src/js/app.js'
        ]
    },

    output: {
        filename: "bundle.min.js",
        path: path.resolve(__dirname, "./dist/js"),
        publicPath: '/js'
    },

    watch : false,
    mode : 'production',
    devtool : "source-map",

    module : {
        rules: [
            {
                test: /\.m?js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env']
                    }
                }
            }
        ]
    },

    plugins: [
        new webpack.HotModuleReplacementPlugin()
    ]
};