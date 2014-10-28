'use strict'

var _ = require('underscore');

module.exports = _.defaults({
    // Attempt to read parameters from command line, for instance --target=URL
    // maps to npm_config_target

    extraCaCert: process.env.npm_config_cacert,
    targetBaseUrl: process.env.npm_config_target,
}, {
    // Default parameter values

    // The path to a CA certificate to inject into node. This is needed if the
    // target requires HTTPS and is signed by a CA that is not included in
    // node's distribution of CA certificates (such as if it is signed by your
    // own local CA).
    extraCaCert: undefined,

    // The base URL of the target datasucker, without trailing slash. If this
    // is 'http://foo.org', then the tests will check for example that the
    // target serves card data at 'http://foo.org/cards'.
    targetBaseUrl: 'http://localhost:8080',
});
