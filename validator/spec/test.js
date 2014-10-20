var request = require('request');
var should = require('should');
var _ = require('underscore');

var testParams = require('../test-params');

console.log('Validating datasucker at base URL', testParams.targetBaseUrl);

var makeCachedRequest = (function() {
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
})();

describe('The datasucker at ' + testParams.targetBaseUrl, function() {

    var data;
    function getData(apiPath) {
        return function(done) {
            makeCachedRequest(testParams.targetBaseUrl + apiPath, function(error, body) {
                if(error) {
                    throw error;
                }
                data = JSON.parse(body);
                done();
            });
        };
    }

    describe('adds the CORS header to', function() {
        _([
            '/status',
            '/cards',
            '/card/01008',
            '/sets',
        ]).each(function(apiPath) {
            it('the ' + apiPath + ' endpoint', function(done) {
                request(testParams.targetBaseUrl + apiPath, function(error, response) {
                    var headerKey = _(response.headers).chain().keys().find(function(key) {
                        return key.match(/Access-Control-Allow-Origin/i);
                    }).value();
                    (headerKey === null).should.be.false;

                    response.headers.should.have.property(headerKey, '*');
                    done();
                });
            });
        });
    });

    describe('has a /status endpoint', function() {
        beforeEach(getData('/status'));

        it('which contains a "lastupdated" full ISO8601 timestamp', function() {
            var lastupdatedRestringified = new Date(data.lastupdated).toISOString();
            lastupdatedRestringified.should.not.equal('Invalid Date');
            lastupdatedRestringified.should.equal(data.lastupdated);
        });
    });

    describe('has a /cards endpoint', function() {
        beforeEach(getData('/cards'));

        it('which returns an array', function() {
            data.should.be.an.Array;
        });

        it('which returns at least one card', function() {
            data.length.should.be.greaterThan(0);
        });
    });
});
