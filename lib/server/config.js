"use strict";

/**
 * Loads configuration via nconf
 *
 * @module      server/config
 */
var nconf = require("nconf"),
  path = require("path");

function Config() {
  nconf.argv().env();

  var environment = nconf.get("NODE_ENV") || "development";

  nconf.file("local", path.resolve("config", "local.json"));
  nconf.file(environment, path.resolve("config", environment + ".json"));
  nconf.file("default", path.resolve("config", "default.json"));

  nconf.defaults({
    port: process.env.PORT || 4220
  });
}

Config.prototype.get = function (key) {
  return nconf.get(key);
};

module.exports = new Config();
