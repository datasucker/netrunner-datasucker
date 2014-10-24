var fs = require('fs');
var Backbone = require('backbone');
var express = require('express');
var _ = require('underscore');
var mapCard = require('./cgdb-utils').mapCard;
var sprintf = require('util').format;

// The current fallback URL: this can be configured via a DSConfig property of ( dataURL : __url__)
var fallbackDataURL = 'http://www.cardgamedb.com/deckbuilders/androidnetrunner/database/anjson-cgdb-adn18.jgz';

// set to false if you want imagesrc to hotlink directly to CardGameDB.com
var sideLoadImages = true;

var CARDS_FILE = 'data/cards.json';
var LAST_UPDATED_FILE = 'data/lastupdated';

fs.mkdir('data');

var app = express();
app.set('jsonp callback', true);

var Card = Backbone.Model.extend({ idAttribute: 'code' });
var CardList = Backbone.Collection.extend({ model: Card });

var cards = new CardList();
var lastupdated = new Date(0);

fs.readFile(CARDS_FILE, { encoding: 'utf8' }, function(error, data) {
	if(error) {
		console.log('Failed to read card data from file', CARDS_FILE, 'update from CGDB may be necessary.');
		return error;
	}
	cards.set(JSON.parse(data));
	console.log('Card data successfully read from', CARDS_FILE);
});

fs.readFile(LAST_UPDATED_FILE, { encoding: 'utf8' }, function(error, data) {
	if(error) {
		console.log('Failed to read lastupdated from file', LAST_UPDATED_FILE);
		return error;
	}
	lastupdated = new Date(data);
	console.log(sprintf('lastupdated successfully read from %s: %s', LAST_UPDATED_FILE, lastupdated.toISOString()));
});

function writeCardData() {
	fs.writeFile(CARDS_FILE, JSON.stringify(cards), function(error) {
		if(error) {
			console.log('Failed to write card data to', CARDS_FILE, error);
			throw error;
		}
		console.log('Card data successfully written to', CARDS_FILE);
	});
}

function updateLastupdated() {
	var tempLastupdated = new Date();

	fs.writeFile('data/lastupdated', tempLastupdated.toISOString(), function(error) {
		if(error) {
			console.log('Failed to write data/lastupdated', error);
			throw error;
		}
		lastupdated = tempLastupdated;
		console.log('Updated lastupdated to', lastupdated.toISOString());
	});
}

cards.on('add remove change', _.debounce(writeCardData, 5000));

function addRoute(path, jsonBuilder) {
	return app.get(path, function(req, res) {
		res.header('Access-Control-Allow-Origin', "*");
		return res.jsonp(jsonBuilder(req, res));
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
