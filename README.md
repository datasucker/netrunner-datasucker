Netrunner Datasuckers
=====================

The primary goal of Datasuckers is to decentralize the storage of Netrunner card data. The dispersal of this data across various servers will remove the need for tools and utilities to embed any copyrighted work.

#### Required API
Datasuckers must implement a standardized REST API:
- `/cards` **=>** returns an Array of Card Objects
- `/card/[code]` **=>** returns a single Card Object that matches [code]
- `/sets` **=>** returns an Array of Set Objects
- `/status` **=>** returns a Status Object

#### Response Requirements
All responses must have the the appropriate **[CORS](http://en.wikipedia.org/wiki/Cross-origin_resource_sharing)** header:
```
response.header['Access-Control-Allow-Origin'] = '*'
```
In addition, all responses should follow the **[JSONP](http://en.wikipedia.org/wiki/JSONP)** usage pattern.

#### Card Objects
Datasuckers must return JSON card objects that follow this naming and type convention:
- `card.agendapoints` (integer => only used if card is an agenda)
- `card.baselink` (integer => only used if card is a runner identity)
- `card.code` (string => last 5 digits of the GUIDs, ex: "01023" => set 01, card 023)
- `card.cost` (integer)
- `card.faction` (string)
- `card.flavor` (string)
- `card.factioncost` (integer)
- `card.images` (array => may be more than one if the card has alternate art, primary art is index 0)
  - `illustrator` (string)
  - `src` (string)
- `card.influencelimit` (integer => only used if card is an identity)
- `card.memoryunits` (integer => only used if card is a runner program)
- `card.mindecksize` (integer => only used if card is an identity)
- `card.number` (integer => number within the set)
- `card.maxperdeck` (integer => how many of this card are allowed in a deck)
- `card.quantity` (integer => how many of this card are in the set/pack)
- `card.regex` (string => regular expression pattern for matching cards with varying text)
- `card.set` (string => name of the set/datapack)
- `card.setcode` (string => internal code for set, not suitable for sorting purposes)
- `card.side` (string => "Runner" or "Corp")
- `card.strength` (integer)
- `card.subtype` (string => if set, list of card subtypes separated by ' - ')
- `card.text` (string)
- `card.title` (string)
- `card.trash` (integer)
- `card.type` (string)
- `card.uniqueness` (boolean)
- `card.url` (string => card game DB spoiler URL)
```
// Example Card Object for 'Datasucker'
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
```
*Some card properties are optional if not applicable to the card type.*

#### Set Objects
Datasuckers must return JSON set objects with this convention:
- `set.cyclenumber` (integer)
- `set.name` (string)
- `set.number` (integer => sort order within all of the sets)
- `set.setcode` (string => matches card.setcode)
- `set.total` (integer => number of cards in this set)
```
// Example Set Object for the Core set
{
  "name": "Core",
  "cyclenumber": 1,
  "setcode": "223",
  "total": 113,
  "number": 1
}

// Example Set Object for the First Contact Data Pack
{
  "name": "First Contact",
  "cyclenumber": 6,
  "setcode": "359",
  "total": 20,
  "number": 18
}
```

#### Status Object
The /status endpoint returns a JSON object:
- `lastupdated` (string => ISO8601 timestamp)
```
// Example Object return from the /status endpoint
{
  "lastupdated": "2014-09-22T22:12:52.295Z"
}
```
The **lastupdated** value will help the Datasucker network identify stale data in the future.


#### TLDR
The Datasucker API represents the aboslutely smallest possible API needed to power the majority of external Apps.
Any search feature, sorting, querying, sub-queries, etc. must be built external to the Datasucker API.

This repository holds what you need to spin up your own Datasucker that is self-maintaining and can clone itself from other Datasuckers.

The servers hosting this data will be private and not easily discoverable. The data that the servers are hosting is also freely available from the copyright owners.
