/**
 * # Bot type implementation of the game stages
 * Copyright(c) 2018 Stefano Balietti <futur.dorko@gmail.com>
 * MIT Licensed
 *
 * http://www.nodegame.org
 * ---
 */
const ngc = require('nodegame-client');
const J = ngc.JSUS;

module.exports = function(treatmentName, settings, stager, setup, gameRoom) {


    let channel = gameRoom.channel;
    let logic = gameRoom.node;

    stager.extendAllSteps(function(o) {
        o.cb = function() {
            //var node, stepObj, id;
            let stepObj = this.getCurrentStepObj();
            let id = stepObj.id;
            let node = this.node;

            // We do not actually play.

            if (id === 'decision') {
                node.on('PLAYING', function() {
                    node.timer.random.exec(function() {
                        let decision, departure;

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
