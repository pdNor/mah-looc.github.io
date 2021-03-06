module.exports = {
    entry: __dirname + "/assets/app/main.js",
    output: {
        path: __dirname + "/assets/js",
        filename: "bundle.js"
    },
    module: {
        loaders: [
            { test: /\.js$/, exclude: /node_modules/, loader: "babel-loader" }
        ]
    }
};
