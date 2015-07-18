/**
 * # Logic type implementation of the game stages
 * Copyright(c) 2015 Stefano Balietti <futur.dorko@gmail.com>
 * MIT Licensed
 *
 * http://www.nodegame.org
 * ---
 */

"use strict";

var ngc = require('nodegame-client');
var J = require('JSUS').JSUS;
var stepRules = ngc.stepRules;

var counter = 0;

module.exports = function(treatmentName, settings, stager, setup, gameRoom) {

    var node = gameRoom.node;
    var channel =  gameRoom.channel;

    var dk = require('descil-mturk')();

    // Must implement the stages here.

    // Increment counter.
    counter = counter ? ++counter : settings.SESSION_ID || 1;

    stager.setOnInit(function() {
        // Initialize the client.

        node.on.preconnect(function(p) {
            var code, reconStage, payoff;

            console.log('Oh...somebody reconnected!', p.id);
            reconStage = node.player.stage;

            gameRoom.setupClient(p.id);

            // Start the game on the reconnecting client.
            node.remoteCommand('start', p.id, { step: false });
            // Add player to player list.
            node.game.pl.add(p);
            // Send player to the current stage.
            node.remoteCommand('goto_step', p.id, reconStage);

            // If we are in the last step.
            if (node.game.compareCurrentStep('end') === 0) {
                payoff = doCheckout(p);
                // If player was not checkout yet, do it.
                if (payoff) postPayoffs([payoff]);
            }
        });

        node.on('in.set.DATA', function(msg) {
            msg.data.treatment = treatmentName;
            msg.data.session = node.nodename;
        });

        // Sort: car first, and cars are sorted by departure time.
        node.game.memory.globalCompare = function(a, b) {
            if (a.value.decision === 'car' && b.value.decision === 'bus') {
                return -1;
            }
            if (a.value.decision === 'bus' && b.value.decision === 'car') {
                return 1;
            }
            if (a.value.departureTime < b.value.departureTime) return -1;
            if (a.value.departureTime > b.value.departureTime) return 1;
            return Math.random(0,1) > 0.5 ? -1 : 1;
        };

        this.computePayoff = function(e) {
            var payoff, s;
            var player;
            s = node.game.settings;
            if (e.value.decision === 'car') {
                if (e.gotCar) {
                    payoff = s.carY + (s.slopePayoff * e.value.departureTime);
                }
                else {
                    payoff = 0;
                    // s.busY - (s.slopePayoff * e.value.departureTime);
                }
            }
            else {
                payoff = s.busY;
            }
            e.payoff = payoff;
            // Keep track of sum of payoffs and number or rounds played.
            player = channel.registry.getClient(e.player);
            player.payoff = (player.payoff || 0) + payoff;
            player.rounds = (player.rounds || 0) + 1;
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
                if (e.value.decision === 'car') {
                    results.totCar++;
                    results.avgDepartureCar += e.value.departureTime;
                    e.gotCar = carCounter++ < carLimit ? true : false;
                }
                else {
                    results.totBus++;
                    e.gotCar = false;
                }
                node.game.computePayoff(e);
            });
            results.avgDepartureCar = results.totCar === 0 ? 'NA' :
                Math.floor(results.avgDepartureCar / results.totCar);

            return results;
        };

        this.sendResults = function(stage, globalResults) {
            node.game.memory.stage[stage].each(function(e) {
                node.say('results', e.player, {
                    global: globalResults,
                    decision: e.value.decision,
                    gotCar: e.gotCar,
                    departure: e.value.departureTime,
                    payoff: e.payoff
                });
            });
        };

    });

    stager.extendStep('quiz', {
        cb: function() {
            console.log('Quiz');
        }
    });

    stager.extendStep('decision', {
        cb: function() {
            console.log('Game round: ' + node.player.stage.round);
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
            var payoffs, code, payoff;
            payoffs = node.game.pl.map(doCheckout);
            node.game.memory.save(channel.getGameDir() + 'data/data_' +
                                  node.nodename + '.json');

            postPayoffs(payoffs);
        },
        stepRule: stepRules.SOLO,
    });

    // Here we group together the definition of the game logic.
    return {
        nodename: 'lgc' + counter,
        // Extracts, and compacts the game plot that we defined above.
        plot: stager.getState()
    };

    // Helper functions.

    /**
     * ## doCheckout
     *
     * Checks if a player has played enough rounds, and communicates the outcome
     *
     * @param {object} p A player object with valid id
     * @param {object} code Optional. The code object from the registry (avoid
     *   loading it twice)
     *
     * @return {object} A payoff object as required by descil-mturk.postPayoffs.
     *   If the player has not completed enough rounds returns undefined.
     */
    function doCheckout(p) {
        var code;
        code = channel.registry.getClient(p.id);
        if (code.checkout) {
            node.remoteAlert('Hi! It looks like you have already ' +
                             'completed this game.', p.id);
            return;
        }
        // Computing payoff and USD.
        code.checkout = true;

        // Must have played at least half of the rounds.
        if ((code.rounds || 0) < Math.floor(settings.REPEAT / 2)) {
            code.fail = true;
        }
        else {
            code.payoff = code.payoff || 0;
            code.usd = Math.floor(code.payoff * settings.exchangeRate);
        }

        // Sending info to player.
        node.say('win', p.id, {
            ExitCode: code.ExitCode,
            fail: code.fail,
            payoff: code.payoff,
            usd: code.usd
        });

        return {
            AccessCode: p.id,
            Bonus: code.usd,
            BonusReason: 'Full bonus.'
        };
    }

    function postPayoffs(payoffs) {
        dk.postPayoffs(payoffs, function(err, response, body) {
            if (err) {
                node.err("adjustPayoffAndCheckout: " +
                         "dk.postPayoff: " + err);
            };
        });
    }
};
