Netrunner Datasuckers
=====================

The primary goal of Datasuckers is to decentralize the storage of Netrunner card data. The dispersal of this data across various servers will remove the need for tools and utilities to embed any copyrighted work and thus hopefully avoid a legal confrontation.

Datasuckers must implement a standardized REST API:
- /cards
- /card/$cardCode
- /sets
- /status

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

Some card properties are optional if not applicable to the card type.

Datasucker must return JSON set objects with this convention:
- set.name (string)
- set.cyclenumber (integer)
- set.setcode (string => matches card.setcode)
- set.total (integer)
- set.number (integer => sort order of all sets)

The /status endpoint returns a JSON object:
- lastupdated (string => timestamp, milliseconds since the epoch)

The Datasucker API represents the aboslutely smallest possible API needed to power external Apps.
Any search feature, sorting, querying, sub-queries, etc. must be built external to the Datasucker API.

This repository holds what you need to spin up your own Datasucker that is self-maintaining and can clone itself from other Datasuckers.

The servers hosting this data will be private and not easily discoverable. The data that the servers are hosting is also freely available from the copyright owners.