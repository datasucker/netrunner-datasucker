var _ = require('underscore');

module.exports = _.defaults({
    // Attempt to read parameters from command line, for instance --target=URL
    // maps to npm_config_target

    targetBaseUrl: process.env.npm_config_target,
}, {
    // Default parameter values

    // The base URL of the target datasucker, without trailing slash. If this
    // is 'http://foo.org', then the tests will check for example that the
    // target serves card data at 'http://foo.org/cards'.
    targetBaseUrl: 'http://localhost:8080',
});
