// Map the obscure / terrible property names of the raw JSON data to better types and name conventions
module.exports.mapCard = function mapCard(rawCard) {
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
		card.url = 'http://www.cardgamedb.com/index.php/netrunner/android-netrunner-card-spoilers/_/' + rawCard.furl;
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
