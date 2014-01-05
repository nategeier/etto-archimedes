"use strict";

/**
 * Model Index
 *
 * @module      models/index
 * @description Loads all models via the `require-directory` module
 */
var models = module.exports = function (conf, log) {
  return require("require-directory")(module);
};
