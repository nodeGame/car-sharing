/**
 * # Waiting Room settings
 * Copyright(c) 2019 Stefano Balietti <futur.dorko@gmail.com>
 * MIT Licensed
 *
 * http://www.nodegame.org
 * ---
 */
module.exports = {

    // Exec mode.
    EXECUTION_MODE: 'WAIT_FOR_N_PLAYERS',

    // How many clients must connect before groups are formed.
    POOL_SIZE: 5,

    // The size of each group.
    GROUP_SIZE: 5,

    // Treatment assigned to groups.
    // If left undefined, a random treatment will be selected.
    // Use "treatment_rotate" for rotating all the treatments.
    CHOSEN_TREATMENT: 'treatment_rotate',

    // Maximum waiting time.
    MAX_WAIT_TIME: 600000,
    
    ALLOW_PLAY_WITH_BOTS: true
};
