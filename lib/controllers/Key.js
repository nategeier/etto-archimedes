"use strict";

var log = require("npmlog");

var async = require("async"),
  Key = require("../models/Key");



/**
 * sync saveBambooKeys
 -----
 *
 */

var saveBambooKey = function (req, res) {

  Key.updateBambooKey(req.body, function (err, results) {

    if (err) {
      return res.json(500, err);
    }
    return res.json(200, results);
  });
};


/**
 * sync BambooHR
 -----
 *
 */


var find = function (req, res) {

  var id = req.body.companyId;


  Key.findBambooKey(id, function (err, results) {

    if (err) {
      log.error("req", err);
      return res.json(500, "Error");
    }
    // If searching by ID found nothing return 404
    if (results && results.length === 0 && id) {
      return res.json(404, "Not Found");
    }

    // Otherwise return the object
    return res.json(200, results);
  });
};



module.exports = {
  saveBambooKey: saveBambooKey,
  find: find
};
