// TODO: Pass errors as json, change client to present the errors

'use strict';

let CollisionRateHandler = require(process.cwd() + "/app/controllers/CollisionRateHandler.server.js");
let neutralsJSON = require(process.cwd() + "/neutrals.json");

module.exports = (app) => {

  let collisionRateHandler = new CollisionRateHandler();

  app.get("/", (req, res) => {
    res.sendFile(process.cwd() + "/dist/index.html");
  });

  app.get("/api/rate/findneutral", (req, res) => {

    let temp = req.query.temp;
    let format = req.query.format;
    let neutral = req.query.neutral;
    let ionMass = req.query.ionmass;

    if (!Number(ionMass) || !neutral || neutralsJSON[neutral] === undefined || Number(ionMass) === 0) {
      console.log("Not Found: No ion mass or neutral specified or neutral not found.");
      res.status(404).send(res.statusCode + " Not Found. No ion mass or neutral specified or neutral not found.");
    } else if (temp === "range" && format === "csv") {
      res.status(200).send("format csv");
    } else if (temp === "range") {
      res.status(200).send(collisionRateHandler.rangeOfRatesFindNeutral(req));
    } else {
      res.status(200).send(collisionRateHandler.singleRateFindNeutral(req));
    }

  });

  app.get("/api/rate/", (req, res) => {
    let temp = req.query.temp;
    let format = req.query.format;
    let ionMass = req.query.ionmass;
    let nMass = req.query.neutralmass;
    let dipoleMoment = req.query.d;
    let polarizability = req.query.pol;

    if (!Number(ionMass) || !Number(nMass) || !dipoleMoment || !Number(polarizability)) {
      console.log("Query is missing values.");
      res.status(404).send(res.statusCode + " Not Found. Query is missing values.");
    } else if (temp === "range" && format === "csv") {
      res.status(200).send("format csv");
    } else if (temp === "range") {
      res.status(200).send(collisionRateHandler.rangeOfRatesWithParams(req));
    } else {
      res.status(200).send(collisionRateHandler.singleRateWithParams(req));
    }

  });
}
