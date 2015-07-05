/**
 * # Player type implementation of the game stages
 * Copyright(c) 2015 Stefano Balietti <futur.dorko@gmail.com>
 * MIT Licensed
 *
 * Each client type must extend / implement the stages defined in `game.stages`.
 * Upon connection each client is assigned a client type and it is automatically
 * setup with it.
 *
 * http://www.nodegame.org
 * ---
 */
var ngc = require('nodegame-client');
var stepRules = ngc.stepRules;

module.exports = function(treatmentName, settings, stager, setup, gameRoom) {

    var game;

    stager.setOnInit(function() {

        // Initialize the client.

        var header, frame;

        this.randomDecision = function(offer, submitOffer) {
            var decision, departure;
            if (Math.random(0,1) < 0.5) {
                decision = 'car';                
                departure = JSUS.randomInt(-1,60);
            }
            else {
                decision = 'bus';
                departure = 0;
            }            
            node.emit('decision', decision, departure);
        };

        // Setup page: header + frame.
        header = W.generateHeader();
        frame = W.generateFrame();

        // Add widgets.
        this.visualRound = node.widgets.append('VisualRound', header);
        this.timer = node.widgets.append('VisualTimer', header);
    });

    stager.extendStep('instr1', {
        cb: function() {

            W.loadFrame('instructions.htm', function() {

                var button = W.getElementById('read');
                button.onclick = function() {
                    node.done();
                };

            });
        },
        timer: settings.timer.instructions
    });


    stager.extendStep('instr2', {
        cb: function() {

            W.loadFrame('instructions2.htm', function() {

                var button = W.getElementById('read');
                button.onclick = function() {
                    node.done();
                };

            });
        },
        timer: settings.timer.instructions
    });

    stager.extendStep('decision', {
        cb: function() {
            W.loadFrame('decision.htm', function() {

                // Listen on click event.
                node.once('decision', function(decision, departure) {

                    // Store the decision in the server.
                    node.set('decision', {
                        timestamp:  node.timer.getTimeSince('stepping'),
                        time: departure || 0,
                        decision: decision
                    });

                    // Mark the end of the round.
                    node.done();
                });
            });

        },
        timer: {
            milliseconds: settings.timer.decision,
            timeup: function() {
                node.game.randomDecision();
            }
        }
    });


    stager.extendStep('results', {
        cb: function() {
            W.loadFrame('results.htm', function() {
                var choice, departure, arrivalExpected, arrivalActual, payoff;
                var chosenBus, chosenCar, avgDepartureCar, button;

                chosenBus = W.getElementById('chosen-bus');
                chosenCar = W.getElementById('chosen-car');
                avgDepartureCar = W.getElementById('average-car-departure');

                choice = W.getElementById('choice');
                departure = W.getElementById('departure');
                arrivalExpected = W.getElementById('arrival-expected');
                arrivalActual = W.getElementById('arrival-actual');
                payoff = W.getElementById('payoff');

                button = W.getElementById('continue');
                
                node.on.data('results', function(msg) {
                    var results;
                    var expectedTime, actualTime;
                    
                    results = msg.data;
                    console.log('RESULTS ', results);

                    chosenBus.innerHTML = results.global.totBus;
                    chosenCar.innerHTML = results.global.totCar;
                    avgDepartureCar.innerHTML = results.global.avgDepartureCar;

                    choice.innerHTML = results.decision;
                    departure.innerHTML = results.departure;

                    if (results.decision === 'bus') {
                        expectedTime = actualTime = '12:00';
                    }
                    else {
                        execptedTime = 'AA';
                        actualTime = 'BB';
                    }

                    arrivalExpected.innerHTML = expectedTime;
                    arrivalActual.innerHTML = actualTime;

                    payoff.innerHTML = results.p

                    button.disabled = false;
                    button.onclick = function() {
                        node.done();
                    };

                });
            });
        },
        timer: settings.timer.results
    });

    stager.extendStep('end', {
        //frame: 'end.htm',
        cb: function() {
            W.loadFrame('end.htm');
        }
    });

    game = setup;
    game.plot = stager.getState();
    return game;
};
