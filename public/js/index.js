/**
 * # Index script for nodeGame
 * Copyright(c) 2015 Stefano Balietti <futur.dorko@gmail.com>
 * MIT Licensed
 *
 * http://nodegame.org
 * ---
 */
window.onload = function() {
    var node = parent.node;
    node.setup('nodegame', {
        verbosity: 100,
        debug : true,
        window : {
            promptOnleave : false
        },
        env : {
            auto : false,
            debug : false
        },
        events : {
            dumpEvents : true
        },
        socket : {
            type : 'SocketIo',
            reconnect : false
        }
    });

    // Connecting.
    if (location.search) {
        // Pass query arguments on.
        node.connect('/car-sharing', { query: location.search.substr(1) });
    }
    else {
        node.connect('/car-sharing');
    }
};
