Netrunner Datasuckers
=====================

The primary goal of Datasuckers is to decentralize the storage of Netrunner card data. The dispersal of this data across various servers will remove the need for tools and utilities to embed any copyrighted work and thus hopefully avoid a legal confrontation.

Datasuckers must implement a standardized REST API:
- `/cards` **=>** returns an Array of Card Objects
- `/card/[code]` **=>** returns a single Card Object that matches [code]
- `/sets` **=>** returns an Array of Set Objects
- `/status` **=>** returns a Status Object

#### Card Objects
Datasuckers must return JSON card objects that follow this naming and type convention:
- card.code (string => last 5 digits of the GUIDs, ex: "01023" => set 01, card 023)
- card.title (string)
- card.agendapoints (integer)
- card.baselink (integer)
- card.cost (integer)
- card.faction (string)
- card.factioncost (integer)
- card.illustrator (string)
- card.imagesrc (string)
- card.influencelimit (integer)
- card.memoryunits (integer)
- card.mindecksize (integer)
- card.number (integer => number within the set)
- card.maxperdeck (integer)
- card.quantity (integer)
- card.set (string)
- card.setcode (string)
- card.side (string => "Runner" or "Corp")
- card.strength (integer)
- card.subtype (string)
- card.text (string)
- card.trash (integer)
- card.type (string)
- card.uniqueness (boolean)
```
// Example Card Object for 'Datasucker'
{
  "agendapoints": 0,
  "baselink": 0,
  "code": "01008",
  "cost": 1,
  "faction": "Anarch",
  "factioncost": 1,
  "illustrator": "<redacted>",
  "imagesrc": "http://www.somewhere.com/images/01008.png",
  "maxperdeck": 3,
  "memoryunits": 1,
  "number": 8,
  "quantity": 2,
  "set": "Core",
  "setcode": "223",
  "side": "Runner",
  "strength": 0,
  "subtype": "Virus",
  "text": "<redacted>",
  "title": "Datasucker",
  "type": "Program",
  "uniqueness": false
}
```
*Some card properties are optional if not applicable to the card type.*

#### Set Objects
Datasuckers must return JSON set objects with this convention:
- set.name (string)
- set.cyclenumber (integer)
- set.setcode (string => matches card.setcode)
- set.total (integer)
- set.number (integer => sort order within all of the sets)
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
- lastupdated (string => timestamp, milliseconds since the epoch)
```
// Example Object return from the /status endpoint
{
  "lastupdated": "1411257633393"
}
```
The **lastupdated** value will help the Datasucker network identify stale data in the future.


#### TLDR
The Datasucker API represents the aboslutely smallest possible API needed to power external Apps.
Any search feature, sorting, querying, sub-queries, etc. must be built external to the Datasucker API.

This repository holds what you need to spin up your own Datasucker that is self-maintaining and can clone itself from other Datasuckers.

The servers hosting this data will be private and not easily discoverable. The data that the servers are hosting is also freely available from the copyright owners.
