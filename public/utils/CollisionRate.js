'use strict';

let CollisionRate = {

  // Temperatures in Kelvin
  initialTemp: 100,
  finalTemp: 700,

  findTau: function (neutralDipMoment, T, neutralAlpha) {
    let tau = 85.11 * neutralDipMoment * Math.sqrt(1 / (neutralAlpha * T));
    return tau;
  },

  // Langevin rate constant
  findLangevinRate: function (m1, m2, neutralAlpha) {
    // Reduced Mass
    let mu = (m1 * m2/(m1 + m2));

    // Rate in units of cm^3 molecules^-1 s^-1
    let rate = 2.342 * Math.sqrt(neutralAlpha / mu) * 0.000000001;
    return rate;
  },

  // Hitting collision rate constant divided by Langevin rate constant
  find_kSC_over_kL: function (tau) {
    let ratio;
    if (tau > (2 * Math.sqrt(2))) {
      ratio = 0.62 + 0.3371 * tau;
    } else {
      ratio = 0.9754 + Math.pow((tau / Math.sqrt(2)) + 0.509, 2) / 10.526;
    }
    return ratio;
  },

  // Calculates the collision rate and returns a JSON with the parameters used
  // to calculate the rates and the collision rate every one K increment
  calculateRate: function (neutralMass, ionMass, pol, d) {
    let kL = this.findLangevinRate(neutralMass, ionMass, pol);

    let rateArray = []

    for (let t = this.initialTemp; t <= this.finalTemp; t++) {
      let tau = this.findTau(d, t, pol);
      let collRate = this.find_kSC_over_kL(tau) * kL;

      rateArray.push({"temp": t, "rate": collRate});
    }

    let outputJSON = {
      "ionMass": ionMass,
      "neutralMass": neutralMass,
      "dipoleMoment": d,
      "polarizability": pol,
      "rates": rateArray
    };

    return outputJSON;
  }

};

module.exports = CollisionRate;
