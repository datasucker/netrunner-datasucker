
// The current fallback URL: this can be configured via a DSConfig property of ( dataURL : __url__)
var fallbackDataURL = 'http://www.cardgamedb.com/deckbuilders/androidnetrunner/database/anjson-cgdb-adn18.jgz';

// set to false if you want imagesrc to hotlink directly to CardGameDB.com
var sideLoadImages = true;

// Map set names to the standard numerical value (padded with a zero if needed)
// use lower case as the key name as the incoming data will be sanitized.
// the leading zero of the value is required - hence string values and not numbers.
var setNameMap = {
	"core" : "01",
	// Genesis Cycle
	"what lies ahead" : "02",
	"trace amount" : "02",
	"cyber exodus" : "02",
	"a study in static" : "02",
	"humanity's shadow" : "02",
	"future proof" : "02",
	//
	"creation and control" : "03",
	// The Spin Cycle
	"opening moves" : "04",
	"second thoughts" : "04",
	"mala tempora" : "04",
	"true colors" : "04",
	"fear and loathing" : "04",
	"double time" : "04",
	//
	"honor and profit" : "05",
	// The Lunar Cycle
	"upstalk" : "06",
	"the spaces between" : "06",
	"first contact" : "06",
	"up and over" : "06",
	"all that remains" : "06",
	"the source" : "06",
};

// Change this to whatever you want to call the Data Objects in Parse (not exceptionally important)
var CardObjectName = "NRCard";

// Map the obscure / terrible property names of the raw JSON data to better types and name conventions
function mapCard(rawCard) {
	var card = new Object();
	{
		// sanitize the set name by trimming and lower-case
		var setcode = setNameMap[decodeHtmlEntity(rawCard.setname.trim().toLowerCase())];
		if (setcode == null) {
			setcode = "XX";
		}
		// TODO: "num" is currently a 3-digit string. Might want to include a printf javascript lib to guarantee it
		card.code = setcode + rawCard.num;
		card.title = rawCard.name;

		card.agendapoints = parseRawValue(rawCard, "agendapoints", true);
		card.baselink = parseRawValue(rawCard, "link", true);
		card.cost = parseRawValue(rawCard, "cost", true);
		card.faction = parseRawValue(rawCard, "faction", false);
		card.factioncost = parseRawValue(rawCard, "influence", true);
		//card.flavor = parseRawValue(rawCard, "flavor", false);
		card.illustrator = parseRawValue(rawCard, "illustrator", false);
		if (rawCard.img == '') {
			card.imagesrc = "http://www.cardgamedb.com/forums/uploads/an/med_" + rawCard.furl + ".png";
		} else {
			card.imagesrc = "http://www.cardgamedb.com/forums/uploads/an/med_" + rawCard.img + ".png";
		}
		card.influencelimit = parseRawValue(rawCard, "inflimit", true);
		card.memoryunits = parseRawValue(rawCard, "memory", true);
		card.mindecksize = parseRawValue(rawCard, "mindecksize", true);
		card.number = parseRawValue(rawCard, "num", true);
		card.maxperdeck = parseRawValue(rawCard, "max", true);
		card.quantity = parseRawValue(rawCard, "count", true);
		card.set = parseRawValue(rawCard, "setname", false);
		card.side = parseRawValue(rawCard, "side", false);
		card.strength = parseRawValue(rawCard, "strength", true);
		card.subtype = parseRawValue(rawCard, "subtype", false);
		card.text = parseRawValue(rawCard, "text", false);
		card.trash = parseRawValue(rawCard, "trash", true);
		card.type = parseRawValue(rawCard, "type", false);
		card.uniqueness = rawCard.unique == "Yes" ? true : false;
	}
	return card;
}

// encode(decode) html text into html entity
var decodeHtmlEntity = function(str) {
  return str.replace(/&#(\d+);/g, function(match, dec) {
    return String.fromCharCode(dec);
  });
};

// Takes a raw JSON object and a property name and sanitizes it
// This includes removing leading and trailing whitespace,
// ... and converting it to an integer (if requested)
// returns null where appropriate.
function parseRawValue(rawCard, propertyName, returnInteger) {
	if (!(propertyName in rawCard)) {
		return null;
	}
	var property = rawCard[propertyName];
	if (returnInteger) {
		if (typeof property == "string") {
			if (property.length == 0) {
				return null;
			}
			return parseInt(property.trim(), 10);
		}
		return property;
	}
	if (typeof property == "string") {
		return decodeHtmlEntity(property.trim());
	}
	return decodeHtmlEntity(property);
}



// The building blocks!

var express = require('express');
var app = express();
app.set('views', 'cloud/views');
app.set('view engine', 'ejs'); 
app.use(express.bodyParser()); 

app.get('/', function(req, res) {
	new Parse.Query("DSConfig").find().then(function(configParams) {
		var params = new Object();
		configParams.forEach(function(param) {
			params[param.get("key")] = param.get("val");
		});
		res.render("index", params);	
	});
});

app.get('/status', function(req, res) {
	getConfigParam("lastupdated").then(function(configParam) {
		var timestamp = "";
		if (configParam != null) {
			timestamp = configParam.get("val");
		}
		res.json({
			lastupdated : timestamp
		});
	});
});

// TODO: parse has a limit of 1000 objects returned
// ... we need to batch multiple requests before we break 1k cards
app.get('/cards', function(req, res) {
	var cardsArray = [];
	getCards(0, cardsArray, function(results) {
		res.json(results.map(sanitizeCard));
	});
});

function getCards(page, cardsArray, callback) {
	// parse has a object limit of 1000, this will get all cards...
	var pageLimit = 1000;
	new Parse.Query(CardObjectName).limit(pageLimit).skip(page * pageLimit).find().then(function(results) {
		cardsArray = cardsArray.concat(results);
		if (results.length == pageLimit) {
			getCards(page + 1, cardsArray, callback);
		} else {
			callback(cardsArray);			
		}
	});
}

// Converts a Parse Object to a JSON object and removes the Parse fields.
function sanitizeCard(parsecard) {
	var sanitized = parsecard.toJSON();
	// Remove parse data from the JSON object before returning it
	delete sanitized.createdAt;
	delete sanitized.objectId;
	delete sanitized.updatedAt;

	if (sideLoadImages && sanitized.image != null) {
		var image = sanitized.image;
		delete sanitized.image;
		sanitized.imagesrc = image.url;
	}

	return sanitized;
}

// Get a card's JSON data by its code (ex: "01024")
app.get('/card/:code', function(req, res) {
	var code = req.params.code;
	new Parse.Query(CardObjectName).equalTo("code", code).first().then(function(parseCard) {
		if (parseCard == null) {
			res.send(400);
		} else {
			res.json(sanitizeCard(parseCard));
		}
	});
});

// Attach the Express app to Cloud Code.
app.listen();




// Background Job to fetch the latest data and update the Database...
Parse.Cloud.job("refreshData", function(request, status) {
	Parse.Cloud.useMasterKey();

	fetchData(0, 0).then(function() {
		status.success("Finished fetching and updating cards");
	}, function(error) {
		status.error("Error fetching and updating cards");
	});	
});

// this downloads the latest JSON data from CardGameDB and starts the parsing process
// include a "page" value to keep Parse from timing out...
function fetchData(page, pageLength) {
	var promise = new Parse.Promise();
	var dataURL = null;

	// check the config param for an updated dataURL
	getConfigParam("dataURL").then(function(url) {
		if (url != null) {
			dataURL = url.get("val");
		}
		if (dataURL == null || dataURL.length == 0) {
			dataURL = fallbackDataURL;
		}

		Parse.Cloud.httpRequest({ url: dataURL }).then(function(response) {
			// strip off "cards = " from the front and ";" off the end
			var allCards = JSON.parse(response.text.substr(8, response.text.length - 9));
			// console.log(allCards.length);
			if (pageLength > 0) {
				cardsJSON = allCards.slice(pageLength * page, pageLength * (page + 1));
			} else {
				cardsJSON = allCards;
			}

			// cardsJSON is an array of card objects
			var promises = [];
			cardsJSON.forEach(function(rawCard) {
				// map the CGDB json data to something sane...
				var card = mapCard(rawCard);
				promises.push(updateCardData(card));
			});

			promises.push(updateConfigParam("lastupdated", Date.now().toString()));

			// Return a new promise that is resolved when all of card queries / updates are finished
			Parse.Promise.when(promises).then(function() {
				promise.resolve();
			});
		},
		function(error) {
			promise.reject();
		});

	})

	return promise;
}

// takes a JSON card, finds it's Parse equivalent and updates its values if needed
// returns a Promise which is fulfilled after it done updating
function updateCardData(card) {
	Parse.Cloud.useMasterKey();

	var promise = new Parse.Promise();
	new Parse.Query(CardObjectName).equalTo("code", card.code).first().then(function(parseCard) {
		if (parseCard == null) {
			var CardObjectType = Parse.Object.extend(CardObjectName);
			parseCard = new CardObjectType();
		}

		// only update properties that have changed from the source (saves API requests)
		for (var property in card) {
			if (parseCard.get(property) != card[property]) {
				parseCard.set(property, card[property]);
			}
		}

		// dirty will be true only if some data actually changed...
		if (parseCard.dirty()) {
			// if it's new, fetch the image.
			if (parseCard.isNew()) {
				fetchImage(parseCard, true, function() {
					promise.resolve("Saved Card");
				})
			} else {
				parseCard.save(null, {
					success: function(parseCard) {
						promise.resolve("Saved Card");
					},
					error: function(parseCard, error) {
						promise.resolve("Error Saving Card");
					}
				});
			}

		} else {
			promise.resolve("No Change");
		}
	});
	return promise;
}

function updateConfigParam(key, val) {
	var promise = new Parse.Promise();
	new Parse.Query("DSConfig").equalTo("key", key).first().then(function(configParam) {
		if (configParam == null) {
			configParam = new Parse.Object("DSConfig");
			configParam.set("key", key);
		}
		configParam.set("val", val);
		configParam.save(null, {
			success: function(configParam) {
				promise.resolve(configParam);
			},
			error: function(configParam, error) {
				promise.resolve("Error Saving Param");
			}
		});
	});
	return promise;
}

function getConfigParam(key) {
	var promise = new Parse.Promise();
	new Parse.Query("DSConfig").equalTo("key", key).first().then(function(configParam) {
		promise.resolve(configParam);
	});
	return promise;
}

// Try not to run this... it's a complete refresh of EVERY Card Image
Parse.Cloud.job("refreshImages", function(request, status) {
	Parse.Cloud.useMasterKey();

	// get all cards from the database and fetch all images!
	var cardsArray = [];
	getCards(0, cardsArray, function(results) {
		fetchImages(results, function() {
			status.success("Finished fetching card images");
		});
	});
});

function fetchImages(cards, finished) {
	// we do this in a series to prevent parse from choking and opening up too many connections to our image source
	if (cards.length > 0) {
		fetchImage(cards[0], true, function() {
			// shift() modifies the array ...
			cards.shift();
			fetchImages(cards, finished);
		});
	} else {
		finished();
	}
}

function fetchImage(card, saveCard, callback) {
	var url = card.get('imagesrc');
	Parse.Cloud.httpRequest({ url: url }).then(function(response) {
  		var fileName = card.get('code') + '.png';
		var file = new Parse.File(fileName, {base64: response.buffer.toString('base64', 0, response.buffer.length)}, 'image/png');
		file.save().then(function(file) {
			if (file) {
				card.set('image', file);
				if (saveCard) {
					card.save().then(function(card) {
						callback();
					});
				} else {
					callback();
				}

			} else {
				callback();
			}
		},
		function(file, error) {
			callback();
		});
	},
	function(error) {
		callback();
	});
}
