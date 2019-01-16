/**
 * # Game settings definition file
 * Copyright(c) 2018 Stefano Balietti <futur.dorko@gmail.com>
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

    // Numnber of game rounds repetitions.
    // TODO: if the value is changed the QUIZ page needs to be updated.
    REPEAT: 5,

    // Show up fee.
    showupFee: 1, // 27.07 -> 1.2

    // Slope of the payoff curve.
    slopePayoff: 1,

    // Conversion rate ECU to DOLLARS (for instr).
    exchangeRate: 0.001,

    // TODO: update, use only one.
    // Divider ECU / DOLLARS *
    EXCHANGE_RATE: 0.001,
    
    TIMER: {

        instr1: 90000,
        instr2: 60000,
        quiz: 90000,
        decision: function() {
            if (this.getCurrentGameStage().round === 1) return 45000;
            return 15000;
        },
        results: function() {
            if (this.getCurrentGameStage().round === 1) return 20000;
            return 8000;
        }
    },

    // Treatments definition.

    treatments: {

        noinfo_car25_p5040: {
            description: 'Few cars, low payoff bus',
            info: false,
            carLevel: 0.25,
            carY: 40,
            busY: 50
        },

        noinfo_car50_p5040: {            
            description: 'Average quantity of cars, low payoff bus',
            info: false,
            carLevel: 0.5,
            carY: 40,
            busY: 50
        },

        noinfo_car75_p5040: {
            description: 'Lots of cars, low payoff bus',
            info: false,
            carLevel: 0.75,
            carY: 40,
            busY: 50
        },

        noinfo_car25_p7040: {
            description: 'Few cars, high payoff bus',
            info: false,
            carLevel: 0.25,
            carY: 40,
            busY: 70
        },

        noinfo_car50_p7040: {            
            description: 'Average quantity of cars, high payoff bus',
            info: false,
            carLevel: 0.5,
            carY: 40,
            busY: 70
        },

        noinfo_car75_p7040: {
            description: 'Lots of cars, high payoff bus',
            info: false,
            carLevel: 0.75,
            carY: 40,
            busY: 70
        }
    }
};
