'use strict';

let CollisionRateHandler = require(process.cwd() + "/app/controllers/CollisionRateHandler.server.js");

module.exports = (app) => {

  let collisionRateHandler = new CollisionRateHandler();

  app.get("/", (req, res) => {
    res.sendFile(process.cwd() + "/dist/index.html");
    //res.send("Hello World");
  });

  app.get("/api/rate/", (req, res) => {

    let temp = req.query.temp;
    let format = req.query.format;
    let rate;

    if (temp === "range" && format === "csv") {
      res.send("format csv");
    } else if (temp === "range") {
      res.send(collisionRateHandler.rangeOfRates(req));
    } else {
      res.send(collisionRateHandler.singleRate(req));
    }

  });

}
