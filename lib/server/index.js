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

app.get("/course/:id?", controllers.Course.find);
app.post("/course", controllers.Course.create);
app.put("/course/:id", controllers.Course.update);
app.del("/course/:id", controllers.Course.destroy);

app.get("/coursemeta/:id?", controllers.CourseMeta.find);
app.put("/coursemeta/:id", controllers.CourseMeta.update);

module.exports = app;
