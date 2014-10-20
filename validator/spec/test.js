var request = require('request');
var should = require('should');
var _ = require('underscore');

var testParams = require('../test-params');

console.log('Validating datasucker at base URL', testParams.targetBaseUrl);

describe('The datasucker at ' + testParams.targetBaseUrl, function() {

    var data;
    function getData(apiPath) {
        var cachedData;

        return function(done) {
            request(testParams.targetBaseUrl + apiPath, function(error, response, body) {
                if(!error) {
                    cachedData = body;
                    data = JSON.parse(cachedData);
                } else {
                    cachedData = undefined;
                }

                done();
            });
        };
    }

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
