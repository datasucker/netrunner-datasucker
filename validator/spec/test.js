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

    describe('has a /cards endpoint which', function() {
        beforeEach(getData('/cards'));

        it('returns an array', function() {
            data.should.be.an.Array;
        });

        it('returns at least one card', function() {
            data.length.should.be.greaterThan(0);
        });
    });

    describe('has the Datasucker card (/card/01008 endpoint) which', function() {
        beforeEach(getData('/card/01008'));

        var mandatoryKeys = [
            'code',           // (/string => last 5 digits of the GUIDs, ex: "01023" => set 01, card 023)
            'faction',        // (/string)
            'factioncost',    // (/integer)
            'images',         // (/array => may be more than one if the card has alternate art, primary art is index 0)
               //illustrator, // (/string)
               //src,         // (/string)
            'number',         // (/integer => number within the set)
            'maxperdeck',     // (/integer => how many of this card are allowed in a deck)
            'quantity',       // (/integer => how many of this card are in the set/pack)
            'regex',          // (/string => regular expression pattern for matching cards with varying text)
            'set',            // (/string => name of the set/datapack)
            'setcode',        // (/string => internal code for set, not suitable for sorting purposes)
            'side',           // (/string => "Runner" or "Corp")
            'subtype',        // (/string => if set, list of card subtypes separated by ' - ')
            'text',           // (/string)
            'title',          // (/string)
            'type',           // (/string)
            'url',            // (/string => card game DB spoiler URL)
        ];

        var otherKeys = [
            'flavor',         // (/string)
            'cost',           // (/integer)
            'agendapoints',   // (/integer => only used if card is an agenda)
            'baselink',       // (/integer => only used if card is a runner identity)
            'influencelimit', // (/integer => only used if card is an identity)
            'memoryunits',    // (/integer => only used if card is a runner program)
            'mindecksize',    // (/integer => only used if card is an identity)
            'strength',       // (/integer)
            'trash',          // (/integer)
            'uniqueness',     // (/boolean)
        ];

        _(mandatoryKeys).each(function(key) {
            it('has the ' + key + ' property', function() {
                data.should.have.property(key);
            });
        });
    });
});
