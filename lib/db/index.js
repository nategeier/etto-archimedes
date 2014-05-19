"use strict";

/**
 * Configures MongoDB connection.
 *
 * @module      db/index
 */
var mongoose = require("mongoose"),
  config = require("../server/config"),
  log = require("../server/log");

var connectString = config.get("mongo:url");

var connectOptions = {
  server: {
    auto_reconnect: true
  }
};

mongoose.connect(connectString, connectOptions, function (err) {
  if (err) {
    log.error("etto", err);
  } else {
    log.info("etto", "Using MongoDB on %s with db '%s'",
      mongoose.connection.host,
      mongoose.connection.name);
  }
});

module.exports = mongoose;
