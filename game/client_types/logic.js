/**
 * # Logic type implementation of the game stages
 * Copyright(c) 2017 Stefano Balietti <futur.dorko@gmail.com>
 * MIT Licensed
 *
 * http://www.nodegame.org
 * ---
 */

"use strict";

var ngc = require('nodegame-client');
var J = require('JSUS').JSUS;
var stepRules = ngc.stepRules;
var GameStage = ngc.GameStage;

module.exports = function(treatmentName, settings, stager, setup, gameRoom) {

    var node = gameRoom.node;
    var channel =  gameRoom.channel;

    // Must implement the stages here.

    stager.setOnInit(function() {
        // Initialize the client.

        // Compute the slope.
        this.slopeCar = (100 - settings.carY) / 60;
        this.slopeCarMiss = settings.carY / 60;

        node.on.preconnect(function(p) {
            var code, disconStage, reconStage, payoff;

            // If we are in the last step.
            if (node.game.compareCurrentStep('end') === 0) {
                payoff = doCheckout(p);
                // If player was not checkout yet, do it.
                if (payoff) postPayoffs([payoff]);
            }
        });

        // Remove default (equivalent to node.off (without warnings).
        node.events.ng.off('in.set.DATA');

        node.game.memory.index('plage', function(o) {
            return new GameStage(o.stage).toString() + '_' + o.player
        });
        node.on('in.set.DATA', function(msg) {
            var o = msg.data;

            // Remove any other SET DONE in the same stage by the same player.
            if (o.done) {
                node.game.memory.plage.remove(msg.stage + '_' + msg.from);
            }

            // Decorate it.
            o.player = msg.from;
            o.stage = msg.stage;
            o.treatment = treatmentName;
            o.session = node.nodename;

            // Add it to memory.
            node.game.memory.insert(o);
        });

        // Sort: car first, and cars are sorted by departure time.
        node.game.memory.globalCompare = function(a, b) {
            if (a.decision === 'car' && b.decision === 'bus') return -1;
            if (a.decision === 'bus' && b.decision === 'car') return 1;
            if (a.departureTime < b.departureTime) return -1;
            if (a.departureTime > b.departureTime) return 1;
            return Math.random(0,1) > 0.5 ? -1 : 1;
        };

        this.computePayoff = function(e) {
            var payoff, s;
            var player;
            s = node.game.settings;
            if (e.decision === 'car') {
                if (e.gotCar) {
                    payoff = s.carY + (node.game.slopeCar * e.departureTime);
                }
                else {
                    // payoff = 0;
                    payoff = s.carY -
                        (node.game.slopeCarMiss * e.departureTime);
                }
                // Rounding it.
                payoff = parseFloat(payoff.toFixed(2), 10);
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
                if (e.decision === 'car') {
                    results.totCar++;
                    results.avgDepartureCar += e.departureTime;
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
                    decision: e.decision,
                    gotCar: e.gotCar,
                    departure: e.departureTime,
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
            var payoffs, payoff;
            payoffs = node.game.pl.map(doCheckout);
            node.game.memory.save('data_' + node.nodename + '.json');
            postPayoffs(payoffs);
        },
        stepRule: stepRules.SOLO,
    });


    // Helper functions.

    /**
     * ## doCheckout
     *
     * Checks if a player has played enough rounds, and communicates the outcome
     *
     * @param {object} p A player object with valid id
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
            code.usd = parseFloat(
                ((code.payoff * settings.exchangeRate).toFixed(2)),
                10);
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
        // TODO.
    }

};
