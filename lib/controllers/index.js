"use strict";

/**
 * Controller Index
 *
 * @module      controllers/index
 * @description Loads all controllers via the `require-directory` module
 */
var controllers = module.exports = function (conf, log) {
  return require("require-directory")(module);
};
