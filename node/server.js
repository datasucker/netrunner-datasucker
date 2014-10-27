var request = require('request');
var express = require('express');
var _ = require('underscore');
var mapCard = require('./cgdb-utils').mapCard;
var sprintf = require('util').format;

var data = require('./data');
var cards = data.cards;
var sets = data.sets;
var status = data.status;

// The current fallback URL: this can be configured via a DSConfig property of ( dataURL : __url__)
var fallbackDataURL = 'http://www.cardgamedb.com/deckbuilders/androidnetrunner/database/anjson-cgdb-adn18.jgz';

var app = express();
app.set('jsonp callback', true);

// this downloads the latest JSON data from CardGameDB and starts the parsing process
function fetchCgdbData() {
	console.log('Fetching card data from URL', fallbackDataURL);

	request(fallbackDataURL, function(error, response, body) {
		if(error) {
			throw error;
		}

		// strip off "cards = " from the front and ";" off the end
		var cardsJSON = JSON.parse(body.substr(8, body.length - 9));

		console.log(sprintf('Downloaded %d cards from CardGameDB', cardsJSON.length));

		cards.set(_(cardsJSON).map(mapCard));
		status.save();
	});
}

function addRoute(path, jsonBuilder) {
	return app.get(path, function(req, res) {
		res.header('Access-Control-Allow-Origin', "*");
		return res.jsonp(jsonBuilder(req, res));
	});
}

addRoute('/status', function(req) {
	return status;
});

addRoute('/sets', function(req) {
	return sets;
});

addRoute('/cards', function(req) {
	return cards;
});

// Get a card's JSON data by its code (ex: "01024")
addRoute('/card/:code', function(req, res) {
	'use strict'
	var card = cards.get(req.params.code);
	if(card) {
		return card;
	}
	res.status(404);
	return undefined;
});

var server = app.listen(8080, function() {
	var host = server.address().address;
	var port = server.address().port;

	console.log('Datasucker listening at ' + host + ' port ' + port);
});

var controllerApp = express();
controllerApp.get('/update', function(req, res) {
	fetchCgdbData();
	res.status(200).end();
});

var controlServer = controllerApp.listen(8081, function() {
	var host = controlServer.address().address;
	var port = controlServer.address().port;

	console.log('Datasucker admin API listening at ' + host + ' port ' + port);
})
