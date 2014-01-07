/**
 * CourseMeta Controllers
 *
 * @module      controllers/CourseMeta
 * @description Controllers for the CourseMeta resource
 */
"use strict";

var log = require("npmlog");

var Course = require("../models/Course");

/**
 * CourseMeta find controller
 *
 */
var find = function (req, res) {
  var query = {};

  var id = req.params.id || req.query.id;
  if (id) {
    query = {
      "_id": id
    };
  }

  Course.find(query, function (err, metadata) {
    if (err) {
      log.error("req", err);
      return res.json(500, "Error");
    }
    // If searching by ID found nothing return 404
    if (metadata && metadata.length === 0 && id) {
      return res.json(404, "Not Found");
    }
    // If searching by ID return the bare object
    if (id) {
      // Drop blocks and return
      var meta = metadata[0].toObject();
      delete meta.blocks;
      return res.json(200, meta);
    }
    // Drop the blocks from each Course and return
    return res.json(200, metadata.map(function (course) {
      course = course.toObject();
      delete course.blocks;
      return course;
    }));
  });
};

/**
 * CourseMeta update controller
 *
 */
var update = function (req, res) {
  // TODO: Validation
  Course.findOneAndUpdate({
    "_id": req.params.id
  }, req.body, function (err, metadata) {
    if (err) {
      log.error("req", err);
      return res.json(500, "Error");
    }
    if (metadata === null) {
      return res.json(404, "Not Found");
    }
    return res.json(200, metadata);
  });
};

/**
 * Exported Controllers
 */
module.exports = {
  find: find,
  update: update,
};
