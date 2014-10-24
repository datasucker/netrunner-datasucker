var request = require('request');
var should = require('should');
var _ = require('underscore');
var sprintf = require('util').format;

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
            it(sprintf('the %s endpoint', apiPath), function(done) {
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

    describe('responds with JSONP if requested', function() {
        var callbackParamName = 'callback';
        var callbackName = 'localFunc';

        _([
            '/status',
            '/cards',
            '/card/01008',
            '/sets',
        ]).each(function(apiPath) {
            it(sprintf('at the %s endpoint', apiPath), function(done) {
                request(sprintf('%s%s?%s=%s', testParams.targetBaseUrl, apiPath, callbackParamName, callbackName), function(error, response, body) {
                    if(error) {
                        done();
                        throw error;
                    }

                    var matches = body.match(new RegExp(callbackName + '\\((.*)\\);?'));
                    matches.should.have.length(2);

                    function parseBody() {
                        return JSON.parse(matches[1]);
                    }
                    parseBody.should.not.throw();

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

        var shouldBeString  = function(it) { return it.should.be.a.String; };
        var shouldBeInteger = function(it) { return it.should.be.a.Number; };

        var mandatoryKeys = {
            'code':       function(it) { return it.should.be.a.String.and.match(/^\d{5}$/); },
            'faction':    shouldBeString,
            'images':     function(it) { return it.should.be.an.Array.and.have.property('length').greaterThan(0); },
            'number':     shouldBeInteger,
            'maxperdeck': shouldBeInteger,
            'quantity':   shouldBeInteger,
            'set':        shouldBeString,
            'setcode':    shouldBeString,
            'side':       shouldBeString,
            'subtype':    shouldBeString,
            'text':       shouldBeString,
            'title':      shouldBeString,
            'type':       shouldBeString,
            'url':        shouldBeString,
        };

        _(referenceCards).each(function(referenceCard) {

            describe(sprintf('It has %s at /card/%s', referenceCard.title, referenceCard.code), function() {

                beforeEach(getData('/card/' + referenceCard.code));

                _(mandatoryKeys).each(function(test, key) {
                    it('has the mandatory ' + key + ' property', function() {
                        data.should.have.property(key).which.match(test);
                    });
                });

                _(referenceCard).each(function(value, key) {
                    it(sprintf('with the correct %s value of type %s', key, typeof value), function() {
                        data.should.have.property(key, value).and.be.of.type(typeof value);
                    });
                });
            });
        });
    });
});
