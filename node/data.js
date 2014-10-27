var fs = require('fs');
var Backbone = require('backbone');
var _ = require('underscore');
var sprintf = require('util').format;

var CARDS_FILE = 'data/cards.json';
var LAST_UPDATED_FILE = 'data/lastupdated';
fs.mkdir('data');

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
		fs.writeFile(CARDS_FILE, JSON.stringify(this), { encoding: 'utf8' }, _.bind(function(error) {
			if(error) {
				console.log('Failed to write card data to', CARDS_FILE, error);
				throw error;
			}
			console.log('Card data successfully written to', CARDS_FILE);
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
		this.on('change:lastupdated', this.save, this);

		this.load();
	},

	updateLastupdated: function() {
		this.set('lastupdated', new Date());
	},

	save: function() {
		fs.writeFile(LAST_UPDATED_FILE, this.get('lastupdated').toISOString(), { encoding: 'utf8' }, _.bind(function(error) {
			if(error) {
				console.log('Failed to write', LAST_UPDATED_FILE, error);
				throw error;
			}
			console.log('Saved lastupdated:', this.get('lastupdated').toISOString());
		}, this));
	},

	load: function() {
		fs.readFile(LAST_UPDATED_FILE, { encoding: 'utf8' }, _.bind(function(error, data) {
			if(error) {
				console.log('Failed to read lastupdated from file', LAST_UPDATED_FILE);
				return error;
			}
			this.set('lastupdated', new Date(data));
			console.log(sprintf('lastupdated successfully read from %s: %s', LAST_UPDATED_FILE, status.get('lastupdated').toISOString()));
		}, this));
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
