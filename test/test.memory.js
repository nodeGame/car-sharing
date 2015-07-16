var fs = require('fs');
var should = require('should');
var NDDB = require('NDDB').NDDB;

var numPlayers;
var groupSize;
var numGames;
var filePaths = [];
var dbs = [];
var gameSettings;
var i;

numPlayers = require('./settings.js').numPlayers;
groupSize = require('../waitroom/waitroom.settings.js').GROUP_SIZE;

// TODO: Assuming two players per game.
if (!numPlayers || !groupSize) {
    console.log('Invalid number of players! Check game and test settings.');
    process.exit(1);
}


numGames = Math.floor(numPlayers / groupSize);

// Generate memory file pathnames.
for (i = 0; i < numGames; ++i) {
    filePaths.push('./data/data_lgc' + (i+1) + '.json');
}

describe('The ' + numGames + ' memory files in "data/"', function() {
    it('should exist', function() {
        var gameNo;
        for (gameNo = 0; gameNo < numGames; ++gameNo) {
            fs.existsSync(filePaths[gameNo]).should.be.true;
        }
    });

    it('should be loadable with NDDB', function() {
        var gameNo, db;

        for (gameNo = 0; gameNo < numGames; ++gameNo) {
            db = new NDDB();
            db.load(filePaths[gameNo]);
            db.size().should.be.above(0,
                'Empty DB in game '+(gameNo+1)+'/'+numGames+'!');
            dbs.push(db);
        }
    });
});
