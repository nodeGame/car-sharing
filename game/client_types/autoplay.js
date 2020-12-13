/**
 * # Autoplay code
 * Copyright(c) 2015 Stefano Balietti
 * MIT Licensed
 *
 * Handles bidding, and responds between two players automatically.
 *
 * http://www.nodegame.org
 */

module.exports = function(treatmentName, settings, stager, setup, gameRoom) {

    const ngc =  require('nodegame-client');

    var stager;

    let game = gameRoom.getClientType('player');
    game.nodename = 'autoplay';

    game.env.allowTimeup = true;
    // game.env.allowDisconnect = true;

    game.nodename = 'autoplay';

    stager = ngc.getStager(game.plot);

    stager.extendAllSteps({
        cb: function() {
            if (node.env('allowDisconnect') && Math.random() < 0.5) {
                node.socket.disconnect();
                node.game.stop();
                node.timer.randomExec(function() {
                    node.socket.reconnect();
                }, 4000);
            }
            else {
                if (!node.env('allowTimeup') || Math.random() < 0.5) {
                    node.timer.randomExec(function() {
                        button.click();
                    }, 3000);
                }
            }
        }
    });


    // Gameover will be executed only in 'auto' mode.
    stager.setOnGameOver(function() {
        node.timer.randomExec(function() {
            node.socket.disconnect();
            window.close();
        }, 60000);
    });

    return game;
};
