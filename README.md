Netrunner Datasuckers
=====================

The primary goal of Datasuckers is to decentralize the storage of Netrunner card data. The dispersal of this data across various servers will remove the need for tools and utilities to embed any copyrighted work and thus hopefully avoid a legal confrontation.

Datasuckers must implement a standardized REST API:
- /cards
- /card/$cardCode
- ... possibly more (API is under development)

Datasuckers must return JSON card objects (property types and names are under development):
- card.code
- card.title
- card.agendapoints
- card.baselink
- card.cost
- card.faction
- card.factioncost
- card.illustrator
- card.imagesrc
- card.influencelimit
- card.memoryunits
- card.mindecksize
- card.number
- card.maxperdeck
- card.quantity
- card.set
- card.side
- card.strength
- card.subtype
- card.text
- card.trash
- card.type
- card.uniqueness

The Datasucker API represents the aboslutely smallest possible API needed to power external Apps.
Any search feature, sorting, querying, sub-queries, etc. must be built external to the Datasucker API.

This repository holds what you need to spin up your own Datasucker that is self-maintaining.

The servers hosting this data will be private and not easily discoverable. The data that the servers are hosting is also freely available from the copyright owners and the storage of the data can be considered transient.