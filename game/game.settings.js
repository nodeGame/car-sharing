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
    SESSION_ID: 2,

    // Numnber of game rounds repetitions.
    // TODO: if the value is changed the QUIZ page needs to be updated.
    REPEAT: 2,

    // Show up fee.
    showupFee: 1.2,

    // Slope of the payoff curve.
    slopePayoff: 1,

    // Conversion rate ECU to DOLLARS.
    exchangeRate: 0.001,

    timer: {

        instructions1: 90000,
        instructions2: 60000,
        quiz: 90000,
        decision: function() {
            if (node.player.stage.round === 1) return 45000;
            return 15000;
        },
        results: function() {
            if (node.player.stage.round === 1) return 20000;
            return 8000;
        }

    },

    // Treatments definition.

    treatments: {

        noinfo_car25_p6040: {
            info: false,
            carLevel: 0.25,
            carY: 40,
            busY: 60
        },

//        info_car25_p6040: {
//            info: true,
//            carLevel: 0.25,
//            carY: 40,
//            busY: 60
//        },

        noinfo_car50_p6040: {
            info: false,
            carLevel: 0.5,
            carY: 40,
            busY: 60
        },

//        info_car50_p6040: {
//            info: true,
//            carLevel: 0.5,
//            carY: 40,
//            busY: 60
//        },

        noinfo_car75_p6040: {
            info: false,
            carLevel: 0.75,
            carY: 40,
            busY: 60
        },

//         info_car75_p6040: {
//             info: true,
//             carLevel: 0.75,
//             carY: 40,
//             busY: 60
//         },

////

        noinfo_car25_p7030: {
            info: false,
            carLevel: 0.25,
            carY: 30,
            busY: 70
        },

//        info_car25_p7030: {
//            info: true,
//            carLevel: 0.25,
//            carY: 30,
//            busY: 70
//        },

        noinfo_car50_p7030: {
            info: false,
            carLevel: 0.5,
            carY: 30,
            busY: 70
        },

//         info_car50_p7030: {
//             info: true,
//             carLevel: 0.5,
//             carY: 30,
//             busY: 70
//         },

        noinfo_car75_p7030: {
            info: false,
            carLevel: 0.75,
            carY: 30,
            busY: 70
        },

//         info_car75_p7030: {
//             info: true,
//             carLevel: 0.75,
//             carY: 30,
//             busY: 70
//         },

///


//         noinfo_car25_p6030: {
//             info: false,
//             carLevel: 0.25,
//             carY: 30,
//             busY: 60
//         },
//
//         info_car25_p6030: {
//             info: true,
//             carLevel: 0.25,
//             carY: 30,
//             busY: 60
//         },
//
//         noinfo_car50_p6030: {
//             info: false,
//             carLevel: 0.5,
//             carY: 30,
//             busY: 60
//         },
//
//         info_car50_p6030: {
//             info: true,
//             carLevel: 0.5,
//             carY: 30,
//             busY: 60
//         },
//
//         noinfo_car75_p6030: {
//             info: false,
//             carLevel: 0.75,
//             carY: 30,
//             busY: 60
//         },
//
//         info_car75_p6030: {
//             info: true,
//             carLevel: 0.75,
//             carY: 30,
//             busY: 60
//         },

///


//         noinfo_car25_p7040: {
//             info: false,
//             carLevel: 0.25,
//             carY: 40,
//             busY: 70
//         },
//
//         info_car25_p7040: {
//             info: true,
//             carLevel: 0.25,
//             carY: 40,
//             busY: 70
//         },
//
//         noinfo_car50_p7040: {
//             info: false,
//             carLevel: 0.5,
//             carY: 40,
//             busY: 70
//         },
//
//         info_car50_p7040: {
//             info: true,
//             carLevel: 0.5,
//             carY: 40,
//             busY: 70
//         },
//
//         noinfo_car75_p7040: {
//             info: false,
//             carLevel: 0.75,
//             carY: 40,
//             busY: 70
//         },
//
//         info_car75_p7040: {
//             info: true,
//             carLevel: 0.75,
//             carY: 40,
//             busY: 70
//         },

    }
};
