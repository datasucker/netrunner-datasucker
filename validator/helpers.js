var request = require('request');
var _ = require('underscore');

module.exports = {
    makeCachedRequest: (function() {
        var cachedData = {};
        return function(url, callback) {
            if(cachedData[url]) {
                _.defer(callback, false, cachedData[url]);
                return;
            }

            request(url, function(error, response, body) {
                cachedData[url] = body;
                callback(error, cachedData[url]);
            });
        };
    })(),
};
