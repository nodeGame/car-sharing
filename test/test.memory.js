var fs = require('fs');
var should = require('should');
var NDDB = require('NDDB').NDDB;
var ngc = require('nodegame-client');
var GameDB = ngc.GameDB;
var GameStage = ngc.GameStage;

var numPlayers;
var groupSize;
var nRounds;
var numGames;
var filePaths = [];
var dbs = [];
var gameSettings;
var decisionStage;
var i;


gameSettings = require('../game/game.settings.js');
numPlayers = require('./settings.js').numPlayers;
groupSize = require('../waitroom/waitroom.settings.js').GROUP_SIZE;
nRounds = gameSettings.REPEAT;
decisionStage = 3;

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
            db = new NDDB({ update: { indexes: true } });
            db.hash('stage', function(gb) {
                 if (gb.stage) return GameStage.toHash(gb.stage, 'S');
             });
            db.load(filePaths[gameNo]);
            db.size().should.be.above(0,
                'Empty DB in game '+(gameNo+1)+'/'+numGames+'!');
            dbs.push(db);
        }
    });
});

describe('File contents', function() {

    it('should have the right number of entries', function() {
        var gameNo, nSets;

        // nPlayers * (instr1 + instr2 + quiz + nRounds * (decision + results)).
        nSets = numPlayers * (3 + 2 * nRounds);

        for (gameNo = 0; gameNo < numGames; ++gameNo) {
            dbs[gameNo].size().should.equal(nSets,
                'Wrong number of entries in game '+(gameNo+1)+'/'+numGames+'!');
        }
    });

    it('should have consistent player IDs', function() {
        var gameNo, i;
        var group;

        for (gameNo = 0; gameNo < numGames; ++gameNo) {
            // Assuming two players.
            group = dbs[gameNo].groupBy('player');
            group.length.should.equal(numPlayers,
                'Wrong number of players in game '+(gameNo+1)+'/'+numGames+'!');

            // Check for ID data-type.
            for (i = 0; i < 2; ++i) {
                group[i].db[0].player.should.be.String;
            }
        }
    });
});


describe('Decision rounds', function() {

    it('should have the correct number of repetitions', function() {
        for (gameNo = 0; gameNo < numGames; ++gameNo) {

            // Maximum round should equal the repetition number in the settings.
            dbs[gameNo].stage[decisionStage].max('stage.round').should
                .equal(nRounds, 'Wrong number of rounds in game ' +
                       (gameNo+1) + '/' + numGames + '!');
        }
    });

    it('should have valid values', function() {
        var i, h, roundDb;
        var decision, departure;
        var gameErr;

        for (gameNo = 0; gameNo < numGames; ++gameNo) {
            for (i = 1; i <= nRounds; ++i) {
                roundDb = dbs[gameNo].stage[decisionStage]
                    .select('stage.round', '=', i)
                    .and('stage.step', '=', 1).execute();

                gameErr = (gameNo+1) + '/' + numGames + '!';

                roundDb.each(function(o) {
                    decision = o.value.decision;
                    departure = o.value.departureTime;
                    // Check value ranges.
                    decision.should.be.String;
                    departure.should.be.Number;

                    ['car', 'bus']
                        .should.containEql(decision,
                                           'Invalid decision in game ' +
                                           gameErr);


                    (departure % 1)
                        .should.equal(0,'Decision not an integer in game ' +
                                      gameErr);


                    if (decision === 'car') {
                        departure.should
                            .be.within(0, 60,
                                       'Offer not in [0, 60] in game ' +
                                       gameErr);
                    }
                    else {
                        departure.should.equal(0);
                    }
                });
            }
        }
    });
});
