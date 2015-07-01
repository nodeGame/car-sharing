/**
 * # Logic type implementation of the game stages
 * Copyright(c) 2015 Stefano Balietti <futur.dorko@gmail.com>
 * MIT Licensed
 *
 * http://www.nodegame.org
 * ---
 */
var ngc = require('nodegame-client');
var stepRules = ngc.stepRules;
var constants = ngc.constants;
var J = require('JSUS').JSUS;
var counter = 0;

module.exports = function(treatmentName, settings, stager, setup, gameRoom) {

    var node = gameRoom.node;
    var channel =  gameRoom.channel;

    // Must implement the stages here.

    // Increment counter.
    counter = counter ? ++counter : settings.SESSION_ID || 1;

    stager.setOnInit(function() {
        // Initialize the client.

        node.on('in.set.DATA', function(o) {
            o.treatment = treatmentName;
            o.session = node.nodename;
        });

        // Sort: car first, and cars are sorted by departure time.
        node.game.memory.stage.globalCompare = function(a, b) {
            if (a.decision === 'car' && b.decision === 'bus') return -1;
            if (a.decision === 'bus' && b.decision === 'car') return 1;
            if (a.departureTime < b.departureTime) return -1;
            if (a.departureTime > b.departureTime) return 1;
            return Math.random(0,1) > 0.5 ? -1 : 1;
        };

        this.computePayoff = function(e) {
            e.payoff = J.randomInt(-1, 10);
        };

        this.getResults = function(stage) {
            var previousStage, globalResults, results;
            var carCounter, carLimit;

            carLimit = Math.floor(settings.carLevel * node.game.pl.size()) || 1;

            console.log('car level: ', settings.carLevel);
            console.log('car limit: ', carLimit);

            results = {
                totCar: 0,
                totBus: 0,
                avgDepartureCar: 0
            };

            carCounter = 0;

            // Sort them by departure time.
            node.game.memory.stage[stage].sort();

            node.game.memory.stage[stage].each(function(e) {
                if (e.decision === 'car') {
                    results.totCar++;
                    results.avgDepartureCar += e.value.departure;
                    e.gotCar = carCounter++ < carLimit ? true : false;
                }
                else {
                    results.totBus++;
                    e.gotCar = false;
                }
                node.game.computePayoff(e);
            });

            results.avgDepartureCar =
                (results.avgDepartureCar / results.totCar).toFixed(2);

            return results;
        };

        this.sendResults = function(stage, results) {
            node.game.memory.stage[stage].each(function(e) {
                node.say('results', e.player, {
                    global: results,
                    decision: e.value.decision,
                    gotCar: e.gotCar,
                    departure: e.value.departure,
                    payoff: e.payoff
                });
            });
        };

    });


    stager.extendStep('decision', {
        cb: function() {
            console.log('Game round: ' + node.player.stage.round);

            node.on.data('decision', function(msg) {
                console.log(msg.from, msg.data);
            });

        }
    });


    stager.extendStep('results', {
        cb: function() {

            var results, previousStage;
            
            previousStage = node.game.plot.previous(
                node.game.getCurrentGameStage()
            );

            results = this.getResults(previousStage);

            console.log(results);

            this.sendResults(previousStage, results);

        }
    });

    stager.extendStep('end', {
        cb: function() {
            node.game.memory.save(channel.getGameDir() + 'data/data_' +
                                  node.nodename + '.json');
        }
    });

    stager.setOnGameOver(function() {

        // Something to do.

    });

    // Default options.

    // Wait for other players to be DONE and then step.
    stager.setDefaultStepRule(stepRules.OTHERS_SYNC_STEP);

    // Send the command to step to other players as well.
    stager.setDefaultProperties({
        publishLevel: 0,
        syncStepping: true
    });

    // Here we group together the definition of the game logic.
    return {
        nodename: 'lgc' + counter,
        // Extracts, and compacts the game plot that we defined above.
        plot: stager.getState(),

    };

    // Helper functions.

};
