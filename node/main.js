var Backbone = require('backbone');
var express = require('express');
var _ = require('underscore');
var mapCard = require('./cgdb-utils').mapCard;

// The current fallback URL: this can be configured via a DSConfig property of ( dataURL : __url__)
var fallbackDataURL = 'http://www.cardgamedb.com/deckbuilders/androidnetrunner/database/anjson-cgdb-adn18.jgz';

// set to false if you want imagesrc to hotlink directly to CardGameDB.com
var sideLoadImages = true;

var app = express();
app.set('jsonp callback', true);

var Card = Backbone.Model.extend({ idAttribute: 'code' });
var CardList = Backbone.Collection.extend({ model: Card });

var cards = new CardList();

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
	return cards.get(code);
});

var server = app.listen(8080, function() {
	var host = server.address().address;
	var port = server.address().port;

	console.log('Datasucker listening at ' + host + ' port ' + port);
});
