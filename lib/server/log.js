"use strict";

/**
 * Logging via npmlog
 *
 * @module      server/log
 */
var log = require("npmlog");

function Log() {
  return log;
}

module.exports = new Log();
