var fs = require('fs');
var Backbone = require('backbone');
var _ = require('underscore');
var sprintf = require('util').format;

var CARDS_FILE = 'data/cards.json';
var LAST_UPDATED_FILE = 'data/lastupdated';
fs.mkdir('data');

var Card = Backbone.Model.extend({ idAttribute: 'code' });
var CardList = Backbone.Collection.extend({ model: Card });

var Status = Backbone.Model.extend({
	defaults: {
		lastupdated: new Date(0),
	},

	initialize: function() {
		this.on('change:lastupdated', this.save, this);
	},

	updateLastupdated: function() {
		this.set('lastupdated', new Date());
	},

	save: function() {
		fs.writeFile(LAST_UPDATED_FILE, this.get('lastupdated').toISOString(), _.bind(function(error) {
			if(error) {
				console.log('Failed to write', LAST_UPDATED_FILE, error);
				throw error;
			}
			console.log('Saved lastupdated:', this.get('lastupdated').toISOString());
		}, this));
	},
});

var cards = new CardList();
var sets = new Backbone.Collection();
var status = new Status();

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
	status.set('lastupdated', new Date(data));
	console.log(sprintf('lastupdated successfully read from %s: %s', LAST_UPDATED_FILE, status.get('lastupdated').toISOString()));
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

function updateSets() {
	sets.set(_(cards.groupBy('setcode')).map(function(setCards, setcode) {
		 var representativeCard = _(setCards).chain()
			.pluck('attributes')
			.sortBy('number')
			.last()
			.value();

		 var cycleNumber = parseInt(representativeCard.code.substr(0, 2), 10);
		 return {
			 cyclenumber: cycleNumber,
			 name: representativeCard.set,
			 number: cycleNumber,
			 setcode: setcode,
			 total: representativeCard.number,
		 };
	}));
}

cards.on('add remove change', _.debounce(writeCardData, 5000));
cards.on('add remove change:setcode change:number change:code', _.debounce(updateSets, 1000));

status.listenTo(cards, 'add remove change', _.debounce(status.updateLastupdated, 5000));

module.exports = {
    cards: cards,
    sets: sets,
    status: status,
};
