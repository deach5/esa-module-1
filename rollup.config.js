export default [
    {
        input: 'js/functions.js',
        context: 'window',
        external: [ 'jQuery', 'rebus_config' ],
        output: {
            file: 'js/functions.min.js',
            interop: false,
            format: 'iife',
            name: 'rebus',
            globals: {
                '$': 'jQuery',
                rebus_config: 'rebus_config'
            }
        }
    },
    {
        input: 'js/bootstrap.js',
        context: 'window',
        output: {
            file: 'js/bootstrap.min.js',
            name: 'bootstrap',
            format: 'umd'
        }
    }
];
