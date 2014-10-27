var fs = require('fs');
var Backbone = require('backbone');
var _ = require('underscore');
var sprintf = require('util').format;

var CARDS_FILE = 'data/cards.json';
var LAST_UPDATED_FILE = 'data/lastupdated';
fs.mkdir('data');

function saveToFile(data, filename, callback) {
	fs.writeFile(filename, JSON.stringify(data), { encoding: 'utf8' }, callback);
}

var Card = Backbone.Model.extend({ idAttribute: 'code' });
var CardList = Backbone.Collection.extend({
	model: Card,

	initialize: function() {
		this.on('add remove change', _.debounce(this.save, 5000), this);

		this.load();
	},

	load: function() {
		fs.readFile(CARDS_FILE, { encoding: 'utf8' }, _.bind(function(error, data) {
			if(error) {
				console.log('Failed to read card data from file', CARDS_FILE, 'update from CGDB may be necessary.');
				return error;
			}
			this.set(JSON.parse(data));
			console.log('Card data successfully read from', CARDS_FILE);
		}, this));
	},

	save: function() {
		saveToFile(this, CARDS_FILE, function(error) {
			if(error) {
				console.log('Failed to write card data to', CARDS_FILE, error);
			} else {
				console.log('Successfully wrote card data to', CARDS_FILE);
			}
		});
	},
});

var SetList = Backbone.Collection.extend({
	initialize: function(cards) {
		this.cards = cards;

		this.listenTo(cards, 'add remove change:setcode change:number change:code', _.debounce(this.update, 1000));
	},

	update: function() {
		this.set(_(this.cards.groupBy('setcode')).map(function(setCards, setcode) {
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
});

var Status = Backbone.Model.extend({
	defaults: {
		lastupdated: new Date(0),
	},

	initialize: function() {
		this.on('change:lastupdated', function(model, value) {
			if(_(value).isDate()) {
				model.set('lastupdated', value.toISOString());
			}
		}, this);
		this.on('change:lastupdated', _.debounce(this.save, 10), this);

		this.load();
	},

	updateLastupdated: function() {
		this.set('lastupdated', new Date());
	},

	load: function() {
		fs.readFile(LAST_UPDATED_FILE, { encoding: 'utf8' }, _.bind(function(error, data) {
			if(error) {
				console.log('Failed to read status from file', LAST_UPDATED_FILE);
				return error;
			}
			this.set(JSON.parse(data));
			console.log('status successfully read from', LAST_UPDATED_FILE, ':', this.attributes);
		}, this));
	},

	save: function() {
		var persistentAttributes = this.pick('lastupdated');

		saveToFile(persistentAttributes, LAST_UPDATED_FILE, function(error) {
			if(error) {
				console.log('Failed to write status to', LAST_UPDATED_FILE, error);
			} else {
				console.log('Saved status:', persistentAttributes);
			}
		});
	},
});

var cards = new CardList();
var sets = new SetList(cards);
var status = new Status();

status.listenTo(cards, 'add remove change', _.debounce(status.updateLastupdated, 5000));

module.exports = {
    cards: cards,
    sets: sets,
    status: status,
};
