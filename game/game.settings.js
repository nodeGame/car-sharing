/**
 * # Game settings definition file
 * Copyright(c) 2015 Stefano Balietti <futur.dorko@gmail.com>
 * MIT Licensed
 *
 * The variables in this file will be sent to each client and saved under:
 *
 *   `node.game.settings`
 *
 * The name of the chosen treatment will be added as:
 *
 *    `node.game.settings.treatmentName`
 *
 * http://www.nodegame.org
 * ---
 */


module.exports = {

    // Variables shared by all treatments.

    // Session counter.
    SESSION_ID: 1,

    // Numnber of game rounds repetitions.
    REPEAT: 20,

    timer: {
    
        instructions: 600000,
        decision: 30000,
        results: 30000

    },

    // Treatments definition.

    treatments: {

        noinfo_car25_p6040: {
            info: false,
            carLevel: 0.25,
            payoff: '60/40'
        },

        info_car25_p6040: {
            info: true,
            carLevel: 0.25,
            payoff: '60/40'
        },

        noinfo_car50_p6040: {
            info: false,
            carLevel: 0.5,
            payoff: '60/40'
        },

        info_car50_p6040: {
            info: true,
            carLevel: 0.5,
            payoff: '60/40'
        },

        noinfo_car75_p6040: {
            info: false,
            carLevel: 0.75,
            payoff: '60/40'
        },

        info_car75_p6040: {
            info: true,
            carLevel: 0.75,
            payoff: '60/40'
        },

////

        noinfo_car25_p3070: {
            info: false,
            carLevel: 0.25,
            payoff: '30/70'
        },

        info_car25_p3070: {
            info: true,
            carLevel: 0.25,
            payoff: '30/70'
        },

        noinfo_car50_p3070: {
            info: false,
            carLevel: 0.5,
            payoff: '30/70'
        },

        info_car50_p3070: {
            info: true,
            carLevel: 0.5,
            payoff: '30/70'
        },

        noinfo_car75_p3070: {
            info: false,
            carLevel: 0.75,
            payoff: '30/70'
        },

        info_car75_p3070: {
            info: true,
            carLevel: 0.75,
            payoff: '30/70'
        },

///


        noinfo_car25_p6030: {
            info: false,
            carLevel: 0.25,
            payoff: '60/30'
        },

        info_car25_p6030: {
            info: true,
            carLevel: 0.25,
            payoff: '60/30'
        },

        noinfo_car50_p6030: {
            info: false,
            carLevel: 0.5,
            payoff: '60/30'
        },

        info_car50_p6030: {
            info: true,
            carLevel: 0.5,
            payoff: '60/30'
        },

        noinfo_car75_p6030: {
            info: false,
            carLevel: 0.75,
            payoff: '60/30'
        },

        info_car75_p6030: {
            info: true,
            carLevel: 0.75,
            payoff: '60/30'
        },

///
   
        
        noinfo_car25_p7040: {
            info: false,
            carLevel: 0.25,
            payoff: '70/40'
        },

        info_car25_p7040: {
            info: true,
            carLevel: 0.25,
            payoff: '70/40'
        },

        noinfo_car50_p7040: {
            info: false,
            carLevel: 0.5,
            payoff: '70/40'
        },

        info_car50_p7040: {
            info: true,
            carLevel: 0.5,
            payoff: '70/40'
        },

        noinfo_car75_p7040: {
            info: false,
            carLevel: 0.75,
            payoff: '70/40'
        },

        info_car75_p7040: {
            info: true,
            carLevel: 0.75,
            payoff: '70/40'
        },

///




    }
};
