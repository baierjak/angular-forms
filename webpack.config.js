const fs = require('fs');
const path = require('path');

const webpack = require('webpack');
const merge = require('webpack-merge');
const validate = require('webpack-validator');
const autoprefixer = require('autoprefixer');

const Extract = require('extract-text-webpack-plugin');
const LiveReloadPlugin = require('webpack-livereload-plugin');


const pkg = require('./package.json');

const ROOT_PATH = '.';

const PATHS = {
    app: path.join(__dirname, ROOT_PATH, 'src/'),
    build: path.join(__dirname, ROOT_PATH, 'build/'),
    public: '/build/',
};

const FILES = {};

fs.readdirSync(PATHS.app).forEach((file) => {
    const match = file.match(/(.*)\.(js|jsx)$/);
    if (match) {
        FILES[match[1]] = path.join(PATHS.app, file);
    }
});

const FILENAMES = {
    build: 'js/[name].js',
    vendor: 'js/vendor.js',
    css: 'css/style.css',
    sass: 'css/style.sass.css',
    font: 'fonts/[hash].[ext]',
    images: 'images/[hash].[ext]'
};

const extractCSS = new Extract(FILENAMES.css);
const extractSASS = new Extract(FILENAMES.sass);

const commonConfig = {
    entry: FILES,
    output: {
        path: PATHS.build,
        filename: FILENAMES.build,
        publicPath: PATHS.public
    },
    module: {
        loaders: [
            {
                test: /\.(js|jsx)$/,
                exclude: /(node_modules|bower_components)/,
                loader: 'babel',
            },
            {
                test: /\.scss$/,
                loader: extractSASS.extract('style-loader', 'css-loader!postcss-loader!sass-loader'),
            },
            {
                test: /\.css$/,
                loader: extractCSS.extract('style-loader', 'css-loader'),
            },
            {
                test: /\.(ttf|otf|eot|woff[2]?|svg)(\?[\d\.]*)?$/,
                loader: `file?name=${FILENAMES.font}`,
            },
            {
                test: /\.gif$/,
                loader: `url?name=${FILENAMES.images}&limit=25000&mimetype=image/gif`,
            },
            {
                test: /\.jpeg$/,
                loader: `url?name=${FILENAMES.images}&limit=25000&mimetype=image/jpeg`,
            },
            {
                test: /\.png$/,
                loader: `url?name=${FILENAMES.images}&limit=25000&mimetype=image/png`,
            },
            {
                test: /\.yml$/,
                loader: 'yaml',
            },
            {
                test: /\.json$/,
                loader: 'json',
            },
        ],
    },
    postcss() {
        return [autoprefixer({
            browsers: ['last 2 versions'],
        })];
    },
};

const devConfig = {
    plugins: [
        new LiveReloadPlugin()
    ],
    devtool: 'source-map',
};

const prodConfig = {
    plugins: [
        new webpack.optimize.DedupePlugin(),
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false,
            },
        }),
    ]
};

const commonPlugins = (options) => {
    return {
        entry: {
            vendor: options.vendors,
        },
        plugins: [
            new webpack.optimize.CommonsChunkPlugin('vendor', FILENAMES.vendor),
            new webpack.optimize.OccurenceOrderPlugin(),
            new webpack.NoErrorsPlugin(),
            new webpack.EnvironmentPlugin([
                'NODE_ENV',
            ]),
            new webpack.DefinePlugin({
                __DEV__: JSON.stringify(JSON.parse(process.env.DEBUG || 'false')),
            }),
            new webpack.ProvidePlugin({
                $: "jquery",
                jQuery: "jquery"
            }),
            extractCSS,
            extractSASS,
        ],
    };
};

let config;
console.info(`Building with NODE_ENV = ${process.env.NODE_ENV}`);

if (process.env.NODE_ENV === 'production') {
    config = merge(
        commonConfig,
        commonPlugins({
            vendors: Object.keys(pkg.dependencies),
        }),
        prodConfig
    );
} else {
    config = merge(
        commonConfig,
        commonPlugins({
            vendors: Object.keys(pkg.dependencies),
        }),
        devConfig
    );
}

module.exports = validate(config);
