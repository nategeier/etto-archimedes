"use strict";

/**
 * Configures MongoDB connection.
 *
 * @module      db/index
 */
var db = module.exports = function (conf, log) {
  var mongoose = require("mongoose");

  var connectString = conf.get("mongo:url");

  var connectOptions = {
    server: {
      auto_reconnect: true
    }
  };

  mongoose.connect(connectString, connectOptions, function (err) {
    if (err) {
      log.error("etto", "Error connecting to %s - %s", connectString, err);
    } else {
      log.info("etto", "Using MongoDB at %s", connectString);
    }
  });
};
