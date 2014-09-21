// The current fallback URL: this can be configured via a DSConfig property of ( dataURL : __url__)
var fallbackDataURL = 'http://www.cardgamedb.com/deckbuilders/androidnetrunner/database/anjson-cgdb-adn18.jgz';

// set to false if you want imagesrc to hotlink directly to CardGameDB.com
var sideLoadImages = true;

// Change this to whatever you want to call the Data Objects in Parse (not exceptionally important)
var CardObjectName = "NRCard";

var ConfigObjectName = "DSConfig";
var DATA_URL_KEY = "dataURL";
var ACCESS_CODE_KEY = "accessCode";
var CLONE_LOCKPICK_KEY = "cloneLockpick";
var LAST_UPDATED_KEY = "lastupdated";

// Map the obscure / terrible property names of the raw JSON data to better types and name conventions
function mapCard(rawCard) {
	var card = new Object();
	{
		card.code = rawCard.GUID.slice(-5);
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
		card.setcode = parseRawValue(rawCard, "setid", false);
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
var MD5 = require('cloud/md5');
var express = require('express');
var parseExpressHttpsRedirect = require('parse-express-https-redirect');
var app = express();
app.set('views', 'cloud/views');
app.set('view engine', 'ejs');
app.set('jsonp callback', true);
app.use(express.bodyParser()); 
app.use(parseExpressHttpsRedirect());

app.get('/', function(req, res) {
	new Parse.Query(ConfigObjectName).find().then(function(configParams) {
		var params = new Object();
		configParams.forEach(function(param) {
			params[param.get("key")] = param.get("val");
		});
		res.render("index", params);	
	});
});

app.get('/status', function(req, res) {
	res.header('Access-Control-Allow-Origin', "*");

	getConfigParam(LAST_UPDATED_KEY).then(function(configParam) {
		var timestamp = "";
		if (configParam != null) {
			timestamp = configParam.get("val");
		}
		res.jsonp({
			lastupdated : timestamp
		});
	});
});

app.get('/sets', function(req, res) {
	res.header('Access-Control-Allow-Origin', "*");

	// sets are compiled at request time to keep data fresh
	// TODO: might want to store this result in a local cache and only rebuild when cards are rebuilt

	var cardsArray = [];
	getCards(0, cardsArray, function(results) {
		
		var setsByCode = new Object();
		results.forEach(function(parseCard) {
			var setcode = parseCard.get("setcode");
			var setObject = setsByCode[setcode];
			if (setObject == null) {
				setObject = new Object();

				setObject.name = parseCard.get("set");
				setObject.cyclenumber = parseInt(parseCard.get("code").slice(-5, 2));
				setObject.setcode = parseCard.get("setcode");

				setsByCode[setcode] = setObject;
				setObject.total = 0;
			}
			setObject.total++;
		});

		var sets = [];
		var keys = Object.keys(setsByCode);
		for (var i = 0; i < keys.length; i++) {
			var val = setsByCode[keys[i]];
			sets.push(val);
		}
		sets.sort(function(a, b) {
			return a.setcode - b.setcode;
		});
		var setNumber = 1;
		sets.forEach(function(set) {
			set.number = setNumber;
			setNumber++;
		});

		res.jsonp(sets);
	});
});

app.get('/cards', function(req, res) {
	res.header('Access-Control-Allow-Origin', "*");

	var cardsArray = [];
	getCards(0, cardsArray, function(results) {
		res.jsonp(results.map(sanitizeCard));
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
	res.header('Access-Control-Allow-Origin', "*");

	var code = req.params.code;
	new Parse.Query(CardObjectName).equalTo("code", code).first().then(function(parseCard) {
		if (parseCard == null) {
			res.send(400);
		} else {
			res.jsonp(sanitizeCard(parseCard));
		}
	});
});

app.get('/configure', function(req, res) {
	res.redirect('/');
});

app.post('/configure', function(req, res) {
	var accessCode = req.body.code;
	getConfigParam(ACCESS_CODE_KEY).then(function(ac) {
		if (ac != null && (accessCode == null || accessCode == '')) {
			res.redirect('/');
		} else {
			var storedAccessCode;
			if (ac != null) {
				storedAccessCode = ac.get('val');
			}

			if (ac == null || MD5.hashString(accessCode) == storedAccessCode) {

				if (req.body.updateConfiguration != null) {
					var dataURL = req.body.dataURL;
					var lockpick = req.body.lockpick;
					var newAccessCode = req.body.newCode;

					updateConfigParam(DATA_URL_KEY, dataURL).then(function() {
						updateConfigParam(ACCESS_CODE_KEY, MD5.hashString(newAccessCode)).then(function() {
							updateConfigParam(CLONE_LOCKPICK_KEY, lockpick).then(function() {
								new Parse.Query(CardObjectName).count().then(function(count) {
									res.render('configure', {
										message: 'Configuration Saved',
										code: newAccessCode,
										dataURL: dataURL,
										lockpick: lockpick,
										cardCount: count,
									});
								});

							});
						});
					});

				} else if (req.body.clearData != null) {

					clearData().then(function() {
						getConfigParam(DATA_URL_KEY).then(function(dataURL) {
							getConfigParam(CLONE_LOCKPICK_KEY).then(function(lockpick) {
								new Parse.Query(CardObjectName).count().then(function(count) {
									res.render('configure', {
										message: 'Data Cleared',
										code: accessCode != null ? accessCode : '',
										dataURL: dataURL == null ? fallbackDataURL : dataURL.get('val'),
										lockpick: lockpick == null ? '' : lockpick.get('val'),
										cardCount: count,
									});
								});
							});
						});
					});

				} else {
					getConfigParam(DATA_URL_KEY).then(function(dataURL) {
						getConfigParam(CLONE_LOCKPICK_KEY).then(function(lockpick) {
							new Parse.Query(CardObjectName).count().then(function(count) {
								res.render('configure', {
									code: accessCode != null ? accessCode : '',
									dataURL: dataURL == null ? fallbackDataURL : dataURL.get('val'),
									lockpick: lockpick == null ? '' : lockpick.get('val'),
									cardCount: count,
								});
							});
						});
					});
				}
			} else {
				res.redirect('/');
			}
		}
	});

});


// Attach the Express app to Cloud Code.
app.listen();




// Background Job to fetch the latest data and update the Database...
Parse.Cloud.job("refreshData", function(request, status) {
	Parse.Cloud.useMasterKey();

	// 
	getConfigParam(CLONE_LOCKPICK_KEY).then(function(lockpickKey) {
		if (lockpickKey == null || lockpickKey.get('val') == null || lockpickKey.get('val') == '') {
			fetchFFGData().then(function() {
				status.success("Finished fetching and updating cards from FFG");
			}, function(error) {
				status.error("Error fetching and updating cards from FFG");
			});
		} else {
			var lockpickValue = lockpickKey.get('val');
			cloneDatasucker(lockpickValue).then(function() {
				status.success("Finished cloning cards");
			}, function(error) {
				status.error("Error cloning cards");
			});
		}
	});
});

function clearData(lockpickKey) {
	var promise = new Parse.Promise();
	var cardsArray = [];
	getCards(0, cardsArray, function(results) {
		var promises = [];
		results.forEach(function(card) {
			promises.push(card.destroy());
		});
		Parse.Promise.when(promises).then(function() {
			promise.resolve();
		});
	});
	return promise;
}

function cloneDatasucker(lockpickKey) {
	var promise = new Parse.Promise();
	console.log("Cloning: " + lockpickKey);
	Parse.Cloud.httpRequest({ url: "https://lockpick.parseapp.com/datasucker/" + lockpickKey }).then(function(response) {	
		var lockpickData = JSON.parse(response.text);
		var datasuckerURL = lockpickData.url.replace(/\/$/, "");
		console.log("Datasucker URL to Clone: " + datasuckerURL);
		Parse.Cloud.httpRequest({ url: datasuckerURL + "/cards" }).then(function(response) {
			var cardsJSON = JSON.parse(response.text);
			console.log("Fetched "+ cardsJSON.length + " cards from clone");
			processCardData(cardsJSON, false).then(function() {
				promise.resolve();
			});
		},
		function(error) {
			promise.reject();
		});
	},
	function(error) {
		promise.reject();
	});
	return promise;
}

// this downloads the latest JSON data from CardGameDB and starts the parsing process
// include a "page" value to keep Parse from timing out...
function fetchFFGData() {
	console.log("Fetching FFG Data...");
	var promise = new Parse.Promise();
	var dataURL = null;

	// check the config param for an updated dataURL
	getConfigParam(DATA_URL_KEY).then(function(url) {
		if (url != null) {
			dataURL = url.get("val");
		}
		if (dataURL == null || dataURL.length == 0) {
			dataURL = fallbackDataURL;
		}
		console.log("Fetching FFG Data URL: " + dataURL);

		Parse.Cloud.httpRequest({ url: dataURL }).then(function(response) {
			// strip off "cards = " from the front and ";" off the end
			var cardsJSON = JSON.parse(response.text.substr(8, response.text.length - 9));

			console.log("FFG Data JSON Card Count: " + cardsJSON.length);

			processCardData(cardsJSON, true).then(function() {
				promise.resolve();
			});

		},
		function(error) {
			promise.reject();
		});

	})

	return promise;
}

function processCardData(cardsJSON, mapCards) {
	var promise = new Parse.Promise();
	// cardsJSON is an array of card objects
	var promises = [];
	cardsJSON.forEach(function(cardJSON) {
		// map the CGDB json data to something sane...
		if (mapCards) {
			cardJSON = mapCard(cardJSON);
		}
		promises.push(updateCardData(cardJSON));
	});
	promises.push(updateConfigParam(LAST_UPDATED_KEY, Date.now().toString()));
	// Return a new promise that is resolved when all of card queries / updates are finished
	Parse.Promise.when(promises).then(function() {
		promise.resolve();
	});
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
	new Parse.Query(ConfigObjectName).equalTo("key", key).first().then(function(configParam) {
		if (configParam == null) {
			configParam = new Parse.Object(ConfigObjectName);
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
	new Parse.Query(ConfigObjectName).equalTo("key", key).first().then(function(configParam) {
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
