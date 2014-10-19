console.log('Validating datasucker at base URL', targetBaseUrl);

describe('The datasucker at ' + targetBaseUrl, function() {

    var data;
    function getData(apiPath) {
        var cachedData = $.ajax(targetBaseUrl + apiPath, {
            async: false,
            dataType: 'json',
        });

        return function() {
            data = JSON.parse(cachedData.responseText);
        };
    }

    describe('has a /status endpoint', function() {
        beforeEach(getData('/status'));

        it('which contains a "lastupdated" full ISO8601 timestamp', function() {
            var lastupdatedRestringified = new Date(data.lastupdated).toISOString();
            expect(lastupdatedRestringified).not.toEqual('Invalid Date');
            expect(lastupdatedRestringified).toEqual(data.lastupdated);
        });
    });

    describe('has a /cards endpoint', function() {
        beforeEach(getData('/cards'));

        it('which returns an array', function() {
            expect(_.isArray(data)).toBe(true);
        });

        it('which returns at least one card', function() {
            expect(data.length).toBeGreaterThan(0);
        });
    });
});
