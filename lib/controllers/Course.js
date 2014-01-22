/**
 * Course Controllers
 *
 * @module      controllers/Course
 * @description Controllers for the Course resource
 */
"use strict";

var log = require("npmlog");

var async = require("async");

var Course = require("../models/Course"),
  Tier = require("../models/Tier");

/**
 * Course index controller
 *
 */
var index = function (req, res) {
  Course.find({}, function (err, metadatas) {
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
 * List all courses dedicated to this tier
 *
 */

var listTiersCourses = function (req, res) {

  var tierID = req.body.tierID;

  async.waterfall([

      function (callback) {
        Tier.findOne({
          _id: tierID
        }, "_courses", function (err, results) {
          callback(err, results._courses);
        });

      },
      function (courses, callback) {

        Course.find({
          "_id": {
            $in: courses
          }
        }, function (err, courseList) {
          callback(err, courseList);

        });

      }
    ],
    function (err, courseList) {
      if (courseList === null) {
        courseList = [];
      }
      return res.json(200, courseList);
    });
};

/**
 * Course find controller
 *
 */
var find = function (req, res) {
  var query = {};

  var id = req.body._id || req.params.id || req.query.id;
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
      return res.json(200, metadata[0]);
    }
    // Otherwise return the array of found objects
    return res.json(200, metadata);
  });
};

/**
 * Course create controller
 *
 */
var create = function (req, res) {
  // TODO: Validation
  var newCourse = new Course(req.body);

  newCourse.save(function (err, course) {
    if (err) {
      log.error("req", err);
      return res.json(500, "Error");
    }
    return res.json(201, course);
  });
};

/**
 * Course update controller
 *
 */
var update = function (req, res) {
  // TODO: Add tests for updates via req.body and req.query
  var query = {};
  var id = req.body._id || req.params.id || req.query.id;
  if (id) {
    query = {
      "_id": id
    };
  }

  // TODO: Validation and add tests to ensure validation
  // Drop any disallowed properties
  delete req.body._id;
  delete req.body.createdAt;
  // Set time of last update to now
  req.body.updatedAt = Date.now();
  Course.findOneAndUpdate(query, req.body, function (err, metadata) {
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
 * Course destroy controller
 *
 */
var destroy = function (req, res) {

  Course.findOneAndRemove({
    "_id": req.params.id || req.body.id
  }, function (err, metadata) {
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
  listTiersCourses: listTiersCourses
};
