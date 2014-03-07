"use strict";

/**
 * Logging via npmlog
 *
 * @module      server/log
 */

var log = require("npmlog"),
  config = require("./config");

var logLevel = config.get("logging");
log.level = logLevel || "info";

function Log() {
  return log;
}

module.exports = new Log();
