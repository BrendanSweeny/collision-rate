'use strict';
const massOne = 16; // in daltons
const massTwo = 16; // in daltons
const volPolariz = 2.6; // volume polarizability in A^3
const vacPermittivity = 8.854187817 * 0.000000000001; // farads per meter

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

// Estimated Collision Rate Constant for Polar Systems
function collRateConstant(neutralDipMoment, T, neutralPolariz, neutralMass, ionMass) {
  let tau = findTau(neutralDipMoment, T, neutralPolariz);
  let kL = langevinRate(neutralMass, ionMass, neutralPolariz);
  let collRate = kSC_Over_kL(tau) * kL;
  return collRate;
}

const tiMass = 48;
const oxygenMass = 32;
const oxygenPolariz = 1.12;
const oxygenDipMoment = 0;
const waterMass = 18; // in daltons
const waterPolariz = 1.45; // in A^3
const waterDipMoment = 1.85; // in debyes
const methaneMass = 16;
const n2oDipMoment = 0.161;
const n2oPolariz = 3.03;
const n2oMass = 44;

//console.log(kSC_Over_kL(findTau(waterDipMoment, 298, waterPolariz)) * langevinRate(waterMass, methaneMass, waterPolariz));
//console.log(kSC_Over_kL(findTau(oxygenDipMoment, 350, oxygenPolariz)) * langevinRate(oxygenMass, tiMass, oxygenPolariz));

// Should be 8.76E-10 cm^3 s^-1
//console.log(kSC_Over_kL(findTau(n2oDipMoment, 500, n2oPolariz)) * langevinRate(n2oMass, tiMass, n2oPolariz));

//Should be 8.86E-10 cm^3 s^-1
console.log(kSC_Over_kL(findTau(n2oDipMoment, 300, n2oPolariz)) * langevinRate(n2oMass, tiMass, n2oPolariz));

// CO
//console.log(kSC_Over_kL(findTau(0, 500, 2.91)) * langevinRate(44, tiMass, 2.91));
console.log(collRateConstant(0, 500, 2.91, 44, 48));
