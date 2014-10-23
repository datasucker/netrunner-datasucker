function getSpoilerUrl(cardName) {
    return "http://www.cardgamedb.com/index.php/netrunner/android-netrunner-card-spoilers/_/" + cardName;
}

var enumValues = {
    factions: {
        anarch:   'Anarch',
        criminal: 'Criminal',
        hb:       'Haas-Bioroid',
        jinteki:  'Jinteki',
        nbn:      'NBN',
        shaper:   'Shaper',
        weyland:  'The Weyland Consortium',
    },
    sets: {
        core:    'Core',
    },
    sides: {
        corp:   'Corp',
        runner: 'Runner',
    },
    types: {
        agenda:    'Agenda',
        asset:     'Asset',
        event:     'Event',
        hardware:  'Hardware',
        ice:       'Ice',
        identity:  'Identity',
        operation: 'Operation',
        program:   'Program',
        resource:  'Resource',
        upgrade:   'Upgrade',
    },
};

var referenceCards = {
    datasucker: {
        code:        "01008",
        cost:        1,
        faction:     enumValues.factions.anarch,
        factioncost: 1,
        maxperdeck:  3,
        memoryunits: 1,
        number:      8,
        quantity:    2,
        set:         enumValues.sets.core,
        side:        enumValues.sides.runner,
        subtype:     "Virus",
        title:       "Datasucker",
        type:        enumValues.types.program,
        uniqueness:  false,
        url:         getSpoilerUrl("datasucker-core"),
    },
};

module.exports = {
    referenceCards: referenceCards,
};
