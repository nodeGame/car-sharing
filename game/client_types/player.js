/**
 * # Player type implementation of the game stages
 * Copyright(c) 2017 Stefano Balietti <futur.dorko@gmail.com>
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
        this.visualRound = node.widgets.append('VisualRound', header, {
            title: false
        });
        this.visualTimer = node.widgets.append('VisualTimer', header);
        // Copy reference to have timeup stored on `done`. (for the time being).
        // this.timer = this.visualTimer;

    });

    stager.extendStep('instr1', {
        frame: 'instructions.htm',
        init: function() {
            node.game.visualRound.setDisplayMode(['COUNT_UP_STAGES_TO_TOTAL']);
        },
        cb: function() {
            var button, s, n;
            s = node.game.settings;
            n = node.game.globals.totPlayers;

            W.setInnerHTML('players-count', n);

            W.setInnerHTML('payoff-car', s.carY);
            W.setInnerHTML('payoff-car-2', s.carY);
            W.setInnerHTML('payoff-not-car', s.carY);
            W.setInnerHTML('payoff-bus', s.busY);

            if (s.info) {
                W.setInnerHTML('car-amount', ' to <strong>' +
                               s.carLevel * 100  + '&#37; ' +
                               '</strong> of participants');
            }

            button = W.getElementById('read');
            button.onclick = function() { node.done(); };
        }
    });


    stager.extendStep('instr2', {
        frame: 'instructions2.htm',
        cb: function() {
            var button, s, rate;
            s = node.game.settings;
            rate = Math.ceil(1 / s.exchangeRate);
            W.getElementById('rounds-count').innerHTML = s.REPEAT;
            W.getElementById('ecu-conversion').innerHTML = rate;
            W.getElementById('ecu-conversion-2').innerHTML = rate;
            button = W.getElementById('read');
            button.onclick = function() { node.done(); };
        }
    });

    stager.extendStep('quiz', {
        frame: 'quiz.htm',
        cb: function() {
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
            console.log('Quiz');
        }
    });

    stager.extendStep('decision', {
        frame: 'decision.htm',
        init: function() {
            node.game.visualRound.setDisplayMode([
                'COUNT_UP_ROUNDS_TO_TOTAL',
                'COUNT_UP_STAGES_TO_TOTAL'
            ]);
        },
        cb: function() {
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
        },
        timer: {
            milliseconds: settings.TIMER.decision,
            timeup: function() {
                this.randomDecision();
            }
        }
    });


    stager.extendStep('results', {
        cb: function() {
            W.loadFrame('results.htm', function() {
                var choice, departure, arrivalExpected, arrivalActual, payoff;
                var chosenBus, chosenCar, avgDepartureCar, button;
                var spanAvgDep;

                choice = W.getElementById('choice');
                departure = W.getElementById('departure');
                arrivalExpected = W.getElementById('arrival-expected');
                arrivalActual = W.getElementById('arrival-actual');
                payoff = W.getElementById('payoff');

                button = W.getElementById('continue');

                node.on.data('results', function(msg) {
                    var results, f;
                    var expectedTime, actualTime, depTime;

                    results = msg.data;
                    f = node.game.formatDepartureTime;

                    if (results.decision === 'car') {
                        expectedTime = actualTime = f(results.departure, 1);
                        if (results.gotCar) {
                            choice.innerHTML = 'Car';
                        }
                        else {
                            choice.innerHTML = 'Car (<em>not available!</em>)';
                            actualTime = f(results.departure, 2);
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
                    button.onclick = function() { node.done(); };
                });
            });
        }
    });

    stager.extendStep('end', {
        frame: 'generic.htm',
        // Another widget-step (see the mood step above).
        widget: {
            name: 'EndScreen',
            root: 'container',
            options: {
                panel: false,
                title: false,
                showEmailForm: true,
                email: { errString: 'Please enter a valid email and retry' },
                feedback: { minLength: 50 }
            }
        },
        cb: function() {
            // Reset visual timer (hack).
            node.game.visualTimer.startTiming({ milliseconds: 5000 });
            node.game.visualTimer.setToZero();
            W.restoreOnleave();
            // Msg for testing purposes, ignore it
            console.log('PHANTOMJS EXITING');
        }
    });
    
};


