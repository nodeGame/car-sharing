/**
 * # Logic type implementation of the game stages
 * Copyright(c) 2017 Stefano Balietti <futur.dorko@gmail.com>
 * MIT Licensed
 *
 * http://www.nodegame.org
 * ---
 */

"use strict";

const ngc = require('nodegame-client');
const J = require('JSUS').JSUS;

module.exports = function(treatmentName, settings, stager, setup, gameRoom) {

    let node = gameRoom.node;
    let channel =  gameRoom.channel;

    // Must implement the stages here.

    stager.setOnInit(function() {
        // Initialize the client.

        // Compute the slope.
        this.slopeCar = (100 - settings.carY) / 60;
        this.slopeCarMiss = settings.carY / 60;

        node.on.preconnect(function(p) {
            // DISABLED.
            return;
            // If we are in the last step.
            if (node.game.compareCurrentStep('end') === 0) {
                let payoff = doCheckout(p);
                // If player was not checkout yet, do it.
                // if (payoff) postPayoffs([payoff]);
            }
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
            //var payoff, s;
            let payoff = 0;
            //var player;
            let s = node.game.settings;
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
            let player = channel.registry.getClient(e.player);

            player.win = (player.win || 0) + payoff;
            player.rounds = (player.rounds || 0) + 1;
        };

        this.getResults = function(stage) {
            //var previousStage, globalResults, results;
            //var carCounter, carLimit;

            let carLimit = Math.floor(settings.carLevel *
                                      node.game.pl.size()) || 1;

            console.log('car level: ', settings.carLevel);
            console.log('car limit: ', carLimit);

            let results = {
                totCar: 0,
                totBus: 0,
                avgDepartureCar: 0
            };

            let carCounter = 0;

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
            node.game.memory.stage[stage].each(res => {
                node.say('results', res.player, {
                    global: globalResults,
                    decision: res.decision,
                    gotCar: res.gotCar,
                    departure: res.departureTime,
                    payoff: res.payoff
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

            //var results, previousStage;

            let previousStep = node.game.getPreviousStep();

            let results = this.getResults(previousStep);

            console.log(results);

            this.sendResults(previousStep, results);

        }
    });

    stager.extendStep('end', {
        cb: function() {

            console.log('FINAL PAYOFF PER PLAYER');
            console.log('***********************');

            gameRoom.computeBonus({
                say: true,   // default false
                dump: true,  // default false
                print: true  // default false
                // Optional. Pre-process the results of each player.
                // cb: function(info, player) {
                // // The sum of partial results is diplayed before the total.
                //         info.partials = [ 10, -1, 7];
                // }
            });

            // Dump all memory.
            node.game.memory.save('memory_all.json');
        }
    });
};
