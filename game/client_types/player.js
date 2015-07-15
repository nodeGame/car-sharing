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

    stager.setDefaultGlobals({ totPlayers: gameRoom.game.waitroom.GROUP_SIZE });

    stager.setOnInit(function() {

        // Initialize the client.

        var header, frame;

        node.game.lastDepartureTime = null;
        node.game.lastDecision = null;

        this.formatDepartureTime = function(time, offset) {
            var base;
            time = time || 0;
            base = offset ? 10 + offset : 10;
            if (time === 60) time = (base + 1) + ':00';
            else if (time < 10) time = base + ':0' + time;
            else time = base + ':' + time;
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
            node.game.lastDepartureTime = departure;
            node.game.decisionMade(decision);
            setTimeout(function() {
                W.getElementById('decision').click();
            }, 2000);
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
            otherTd.className = 'td-not-selected';
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
        this.visualTimer = node.widgets.append('VisualTimer', header);
    });

    stager.extendStep('instr1', {
        cb: function() {

            node.game.visualRound.setDisplayMode(['COUNT_UP_STAGES_TO_TOTAL']);

            W.loadFrame('instructions.htm', function() {
                var button, pCount, s, n;
                s = node.game.settings;
                n = node.game.globals.totPlayers;

                W.getElementById('players-count').innerHTML = n;

                W.getElementById('payoff-car').innerHTML = s.carY;
                W.getElementById('payoff-car-2').innerHTML = s.carY;
                W.getElementById('payoff-bus').innerHTML = s.busY;

                if (s.info) {
                    W.getElementById('car-amount').innerHTML =
                        ' to <strong>' + (Math.floor(n*s.carLevel) || 1) +
                        '</strong> cars';
                }

                button = W.getElementById('read');
                button.onclick = function() {
                    node.done();
                };

//                 node.env('auto', function() {
//                     node.randomExec(function() {
//                         button.click();
//                     }, 3000);
//                 });

            });
        },
        timer: settings.timer.instructions1
    });


    stager.extendStep('instr2', {
        cb: function() {

            W.loadFrame('instructions2.htm', function() {
                var button, s, rate;
                s = node.game.settings;
                rate = Math.ceil(1 / s.exchangeRate);
                W.getElementById('rounds-count').innerHTML = s.REPEAT;
                W.getElementById('ecu-conversion').innerHTML = rate;
                W.getElementById('ecu-conversion-2').innerHTML = rate;

                button = W.getElementById('read');
                button.onclick = function() {
                    node.done();
                };

                node.env('auto', function() {
                    node.randomExec(function() {
                        button.click();
                    }, 3000);
                });

            });
        },
        timer: settings.timer.instructions2
    });

    stager.extendStep('quiz', {
        cb: function() {
            W.loadFrame('quiz.htm', function() {
                var button, QUIZ;

                QUIZ = W.getFrameWindow().QUIZ;
                button = W.getElementById('submitQuiz');

                node.on('check-quiz', function() {
                    var answers;
                    answers = QUIZ.checkAnswers(button);
                    if (answers.correct || node.game.visualTimer.isTimeup()) {
                        node.emit('INPUT_DISABLE');
                        // On Timeup there are no answers.
                        node.done(answers);
                    }
                });

                node.env('auto', function() {
                    node.timer.randomExec(function() {
                        node.game.visualTimer.doTimeUp();
                    });
                });
                console.log('Quiz');
            });
        },
        timer: settings.timer.quiz
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

                node.env('auto', function() {
                    node.randomExec(function() {
                        node.game.randomDecision();
                    }, 3000);
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
                var spanAvgDep;

                chosenBus = W.getElementById('chosen-bus');
                chosenCar = W.getElementById('chosen-car');
                avgDepartureCar = W.getElementById('average-car-departure');

                choice = W.getElementById('choice');
                departure = W.getElementById('departure');
                arrivalExpected = W.getElementById('arrival-expected');
                arrivalActual = W.getElementById('arrival-actual');
                payoff = W.getElementById('payoff');

                if (node.game.settings.info) {
                    spanAvgDep = W.getElementById('span-avg-car-departure');
                }

                button = W.getElementById('continue');

                node.on.data('results', function(msg) {
                    var results, f;
                    var expectedTime, actualTime, depTime;

                    results = msg.data;
                    f = node.game.formatDepartureTime;
                    console.log('RESULTS ', results);

                    chosenBus.innerHTML = results.global.totBus;
                    chosenCar.innerHTML = results.global.totCar;

                    if (node.game.settings.info) {
                        depTime = results.global.avgDepartureCar === 'NA' ?
                            'N/A' : f(results.global.avgDepartureCar);
                        avgDepartureCar.innerHTML = depTime;
                        spanAvgDep.style.display = '';
                    }

                    if (results.decision === 'car') {
                        expectedTime = actualTime = f(results.departure, 1);
                        if (results.gotCar) {
                            choice.innerHTML = 'Car';
                        }
                        else {
                            choice.innerHTML = 'Car (<em>not available!</em>)';
                            actualTime = '14:00';
                        }
                    }
                    else {
                        choice.innerHTML = 'Bus';
                        expectedTime = actualTime = '12:00';
                    }
                    departure.innerHTML = f(results.departure);

                    arrivalExpected.innerHTML = expectedTime;
                    arrivalActual.innerHTML = actualTime;

                    payoff.innerHTML = results.payoff;

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
        // frame: 'end.htm',
        cb: function() {
            // Reset visual timer (hack).
            node.game.visualTimer.startTiming({milliseconds: 5000});
            node.game.visualTimer.setToZero();
            W.loadFrame('end.htm', function() {
                var spanCode;

                spanCode= W.getElementById('span-code');
                spanCode.innerHTML = node.player.id;

                node.on.data('win', function(msg) {                    
                    var spanFee, spanEcu, spanDollars;

                    spanFee = W.getElementById('span-fee');
                    spanFee.innerHTML = node.game.settings.showupFee;

                    spanEcu = W.getElementById('span-ecu');
                    spanDollars = W.getElementById('span-dollars');

                    spanEcu.innerHTML = msg.data;
                    spanDollars.innerHTML =
                        (msg.data * node.game.settings.exchangeRate).toFixed(2);

                    W.getElementById('win').style.display = '';
                });
                
                node.on.data('fail', function() {
                    var fail;
                    fail = W.getElementById('fail');
                    fail.innerHTML = 'Unfortunately, you did not complete ' +
                        'at least 50% of the rounds in this experiment, ' +
                        '<br/> therefore you have not earned a payment.';
                    fail.style.display = '';
                });
            
                // Remove warning for closing the tab.
                W.restoreOnleave();
            });
        }
    });

    game = setup;
    game.plot = stager.getState();
    return game;
};
