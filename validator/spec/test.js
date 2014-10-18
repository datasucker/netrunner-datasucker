describe('The datasucker at ' + targetBaseUrl, function() {
    describe('has a /status endpoint', function() {
        var data = $.ajax(targetBaseUrl + '/status', {
            async: false,
            dataType: 'json',
        }).responseJSON;

        it('which contains a "lastupdated" full ISO8601 timestamp', function() {
            var lastupdatedRestringified = new Date(data.lastupdated).toISOString();
            expect(lastupdatedRestringified).not.toEqual('Invalid Date');
            expect(lastupdatedRestringified).toEqual(data.lastupdated);
        });
    });
});
