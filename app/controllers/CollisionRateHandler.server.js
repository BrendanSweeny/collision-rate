'use strict';

let neutralsJSON = require(process.cwd() + "/neutrals.json");

module.exports = CollisionRateHandler;

// Estimated Collision Rate Constant for Polar Systems
function CollisionRateHandler() {

  // Tau
  function findTau (neutralDipMoment, T, neutralAlpha) {
    let tau = 85.11 * neutralDipMoment * Math.sqrt(1 / (neutralAlpha * T));
    return tau;
  }

  // Hitting collision rate constant over Langevin rate constant
  function kSC_Over_kL (tau) {
    let ratio;
    if (tau > (2 * Math.sqrt(2))) {
      ratio = 0.62 + 0.3371 * tau;
    } else {
      ratio = 0.9754 + Math.pow((tau / Math.sqrt(2)) + 0.509, 2) / 10.526;
    }
    return ratio;
  }

  // Langevin rate constant
  function langevinRate (m1, m2, neutralAlpha) {

    // Reduced Mass
    let mu = (m1 * m2/(m1 + m2));

    // Rate in units of cm^3 molecules^-1 s^-1
    let rate = 2.342 * Math.sqrt(neutralAlpha / mu) * 0.000000001;
    return rate;
  }

  this.singleRate = function (req) {
    let neutralQuery = req.query.neutral;
    let ionMass = Number(req.query.ionmass);
    let temp = Number(req.query.temp);
    let neutral = neutralsJSON[neutralQuery];

    console.log("Neutral: " + neutralQuery + ", Ion Mass: " + ionMass + ", T: " + temp);

    let neutralMass = neutral.mass;
    let neutralPolarizability = neutral.polarizability;
    let neutralDipMoment = neutral.dipoleMoment;
    let rate;

    let tau = findTau(neutralDipMoment, temp, neutralPolarizability);
    let kL = langevinRate(neutralMass, ionMass, neutralPolarizability);
    let collRate = kSC_Over_kL(tau) * kL;

    return {"ion": ionMass, "neutral": neutralQuery, "rate": collRate};
  }

  this.rangeOfRates = function (req) {
    let neutralQuery = req.query.neutral;
    let ionMass = Number(req.query.ionmass);
    let initialTemp = 100;
    let finalTemp = 700;
    let neutral = neutralsJSON[neutralQuery];

    console.log("Neutral: " + neutralQuery + ", Ion Mass: " + ionMass + ", T: " + req.query.temp);

    if (neutral === undefined) {
      return [{"rate": null}];
    }

    let neutralMass = neutral.mass;
    let neutralPolarizability = neutral.polarizability;
    let neutralDipMoment = neutral.dipoleMoment;
    let rate;

    let kL = langevinRate(neutralMass, ionMass, neutralPolarizability);

    let rateArray = []

    for (let t = initialTemp; t <= finalTemp; t++) {
      let tau = findTau(neutralDipMoment, t, neutralPolarizability);
      let collRate = kSC_Over_kL(tau) * kL;

      rateArray.push({"temp": t, "rate": collRate});
    }

    return rateArray;
  }

}
