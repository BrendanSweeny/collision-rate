'use strict';

let express = require("express");
let routes = require("./app/routes/index.js");

let app = express();

app.use("/public", express.static(process.cwd() + "/public"));
app.use(express.static(process.cwd() + "/dist"));

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  next();
});

routes(app);

app.listen(process.env.PORT || 8080, () => {
  console.log("Server is listening on port 8080...");
});
