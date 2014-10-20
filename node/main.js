// The current fallback URL: this can be configured via a DSConfig property of ( dataURL : __url__)
var fallbackDataURL = 'http://www.cardgamedb.com/deckbuilders/androidnetrunner/database/anjson-cgdb-adn18.jgz';

// set to false if you want imagesrc to hotlink directly to CardGameDB.com
var sideLoadImages = true;

var mapCard = require('./cgdb-utils').mapCard;
var express = require('express');
var app = express();
app.set('jsonp callback', true);

function addRoute(path, jsonBuilder) {
	return app.get(path, function(req, res) {
		res.header('Access-Control-Allow-Origin', "*");
		return res.jsonp(jsonBuilder(req));
	});
}

addRoute('/status', function(req) {
	return {};
});

addRoute('/sets', function(req) {
	return [];
});

addRoute('/cards', function(req) {
	return cards;
});

// Get a card's JSON data by its code (ex: "01024")
addRoute('/card/:code', function(req) {
	var code = req.params.code;
	return _.findWhere(cards, { code: code });
});

var server = app.listen(8080, function() {
	var host = server.address().address;
	var port = server.address().port;

	console.log('Datasucker listening at ' + host + ' port ' + port);
});

var cards = [
    {
      "code": "01008",
      "cost": 1,
      "faction": "Anarch",
      "factioncost": 1,
      "maxperdeck": 3,
      "memoryunits": 1,
      "number": 8,
      "quantity": 2,
      "regex": "(Datasuckers?|Data Suckers?|01008)",
      "set": "Core",
      "setcode": "223",
      "side": "Runner",
      "subtype": "Virus",
      "text": "<redacted>",
      "title": "Datasucker",
      "type": "Program",
      "uniqueness": false,
      "url": "http:\/\/www.cardgamedb.com\/index.php\/netrunner\/android-netrunner-card-spoilers\/_\/datasucker-core",
      "images": [
	{
	  "src": "<redacted>",
	  "illustrator": "Chelsea Conlin"
	},
	{
	  "src": "<redacted>",
	  "illustrator": "Ed Mattinian"
	}
      ]
    }
];
