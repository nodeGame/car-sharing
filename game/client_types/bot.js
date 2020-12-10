/**
 * # Bot type implementation of the game stages
 * Copyright(c) 2018 Stefano Balietti <futur.dorko@gmail.com>
 * MIT Licensed
 *
 * http://www.nodegame.org
 * ---
 */
var ngc = require('nodegame-client');
var J = ngc.JSUS;

module.exports = function(treatmentName, settings, stager, setup, gameRoom) {


    var channel = gameRoom.channel;
    var logic = gameRoom.node;

    stager.extendAllSteps(function(o) {
        o.cb = function() {
            var node, stepObj, id;
            stepObj = this.getCurrentStepObj();
            id = stepObj.id;
            node = this.node;

            // We do not actually play.

            if (id === 'decision') {
                node.on('PLAYING', function() {
                    node.timer.random.exec(function() {
                        var decision, departure;
                        if (Math.random(0,1) < 0.5) {
                            decision = 'car';
                            departure = J.randomInt(-1,60);
                        }
                        else {
                            decision = 'bus';
                            departure = 0;
                        }

                        // Mark the end of the round, and send results to server.
                        node.done({
                            departureTime: departure,
                            decision: decision,
                            order: 0
                        });
                    });
                });
            }
            else {
                node.timer.random(2000).done;
            }
        };
        return o;
    });
};
