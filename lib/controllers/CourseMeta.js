/**
 * CourseMeta Controllers
 *
 * @module      controllers/CourseMeta
 * @description Controller for CourseMeta
 */
"use strict";

var log = require("npmlog");

var CourseMeta = require("../models/CourseMeta");

/**
 * CourseMeta index controller
 *
 */
var index = function (req, res) {
  CourseMeta.find({}, function (err, metadatas) {
    if (err) {
      log.error("req", err);
      return res.json(500, "Error");
    }
    if (metadatas === null) {
      metadatas = [];
    }
    return res.json(200, metadatas);
  });
};

/**
 * CourseMeta find controller
 *
 */
var find = function (req, res) {
  CourseMeta.findOne({
    "_id": req.params.id
  }, function (err, metadata) {
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
 * CourseMeta create controller
 *
 */
var create = function (req, res) {
  // TODO: Validation
  var newMeta = new CourseMeta(req.body);

  newMeta.save(function (err, metadata) {
    if (err) {
      log.error("req", err);
      return res.json(500, "Error");
    }
    return res.json(201, metadata);
  });
};

/**
 * CourseMeta update controller
 *
 */
var update = function (req, res) {
  // TODO: Validation
  CourseMeta.findOneAndUpdate({
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
 * CourseMeta destroy controller
 *
 */
var destroy = function (req, res) {
  CourseMeta.findOneAndRemove({
    "_id": req.params.id
  }, function (err, metadata) {
    console.log("id: ", req.params.id);
    if (err) {
      log.error("req", err);
      return res.json(500, "Error");
    }
    if (metadata === null) {
      return res.json(404, "Not Found");
    }
    return res.json(204, null);
  });
};

/**
 * Exported Controllers
 */
module.exports = {
  index: index,
  find: find,
  create: create,
  update: update,
  destroy: destroy,
};
