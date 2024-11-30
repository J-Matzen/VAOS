module.exports = {
    webpack: {
        configure: {
            target: 'electron-renderer'
        }
    },
    resolve: {
        fallback: {
            "fs": false,
            "stream": require.resolve("stream-browserify")
        },
    }
};