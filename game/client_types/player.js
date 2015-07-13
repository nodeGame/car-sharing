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

        node.game.lastDepartureTime = null;
        node.game.lastDecision = null;

        this.formatDepartureTime = function(time) {
            time = time || 0;
            if (time === 60) time = '11:00';
            else if (time < 10) time = '10:0' + time;
            else time = '10:' + time;
            return time;
        }

        this.randomDecision = function() {
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

        this.decisionMade = function(decision) {
            var td, otherTd, button;
            node.game.lastDecision = decision;
            if (decision === 'car') {
                td = W.getElementById('td-car');
                otherTd = W.getElementById('td-bus');
            }
            else {
                td = W.getElementById('td-bus');
                otherTd = W.getElementById('td-car');
            }
            // Departure time is changed by the slider for car.
            td.className = 'td-selected';
            otherTd.className = '';
            button = W.getElementById('decision');
            this.updateDecisionButton();
        };

        this.updateDecisionButton = function() {
            var button, decision;
            button = W.getElementById('decision');
            button.disabled = false;            
            if (node.game.lastDecision === 'car') {
                button.value = 'I will take the ' +
                    node.game.lastDecision 
                    + ' and leave at ' + 
                    this.formatDepartureTime(node.game.lastDepartureTime);
            }
            else {
                button.value = 'I will take the bus and leave at 10:00';
            }
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
                var order, tdBus, tdCar, tr;
                
                tdBus = W.getElementById('td-bus');
                tdCar = W.getElementById('td-car');

                // Shuffle tds.
                if (Math.random() < 0.5) {
                    order = 1;
                    tr = W.getElementById('tr-decision');
                    tr.appendChild(tdBus);
                }
                else {
                    order = 0;
                }

                // Reset last decisions.
                node.game.lastDepartureTime = null;
                node.game.lastDecision = null;

                W.getElementById('decision').onclick = function() {

                    if (node.game.lastDecision === 'bus') {
                        node.game.lastDepartureTime = 0;
                    }

                    // Mark the end of the round, and send results to server.
                    node.done({
                        departureTime: node.game.lastDepartureTime || 0,
                        decision: node.game.lastDecision,
                        order: order
                    });
                };
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
