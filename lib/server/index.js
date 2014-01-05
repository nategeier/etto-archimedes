"use strict";

/**
 * Configures and starts the server.
 *
 * @module      server/index
 */
var express = require("express"),
  log = require("npmlog"),
  conf = require("./config");

require("../db")(conf, log);
require("../models")(conf, log);

var controllers = require("../controllers")(conf, log);

var app = express();

app.configure(function () {
  app.use(express.logger("dev"));
  app.use(express.urlencoded());
  app.use(express.json());
  app.use(express.methodOverride());
});

app.listen(conf.get("port"), function () {
  log.info("etto", "Coursetto is all ears on port %d", conf.get("port"));
});

app.get("/coursemeta", controllers.CourseMeta.index);
app.get("/coursemeta/:id", controllers.CourseMeta.find);
app.post("/coursemeta", controllers.CourseMeta.create);
app.put("/coursemeta/:id", controllers.CourseMeta.update);
app.del("/coursemeta/:id", controllers.CourseMeta.destroy);

module.exports = app;
