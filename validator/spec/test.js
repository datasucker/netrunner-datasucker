var request = require('request');
var should = require('should');
var _ = require('underscore');

var testParams = require('../test-params');
var makeCachedRequest = require('../helpers').makeCachedRequest;

var referenceCards = require('../constants').referenceCards;

console.log('Validating datasucker at base URL', testParams.targetBaseUrl);

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
                    if(error) {
                        throw error;
                    }
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

    describe('has a /cards endpoint which', function() {
        beforeEach(getData('/cards'));

        it('is an array', function() {
            data.should.be.an.Array;
        });

        it('contains at least one card', function() {
            data.length.should.be.greaterThan(0);
        });
    });

    describe('has a /sets endpoint which', function() {
        beforeEach(getData('/sets'));

        it('is an array', function() {
            data.should.be.an.Array;
        });

        it('contains at least one set', function() {
            data.length.should.be.greaterThan(0);
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

    describe('has some example cards.', function() {

        _(referenceCards).each(function(referenceCard) {

            describe('It has ' + referenceCard.title + ' at /card/' + referenceCard.code, function() {

                beforeEach(getData('/card/' + referenceCard.code));

                _(referenceCard).each(function(value, key) {
                    it('with the correct ' + key + ' value of type ' + (typeof value), function() {
                        data.should.have.property(key, value).and.be.of.type(typeof value);
                    });
                });
            });
        });
    });
});
