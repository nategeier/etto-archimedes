/**
 * Course Controllers
 *
 * @module      controllers/Course
 * @description Controllers for the Course resource
 */
"use strict";

var async = require("async"),
  _ = require("lodash");

var log = require("../server/log");

var Course = require("../models/Course"),
  Tier = require("../models/Tier");

/**
 * List all courses dedicated to this tier
 *
 */

var listTiersCourses = function (req, res) {

  var id = req.params.id || req.query.id;

  Tier.listTierCourses(id, function (err, results) {

    if (err) {
      return res.json(500, "Error");
    }

    return res.json(200, results);
  });
};

/**
 * listCompanyCourses
 -----
 *
 */

var listCompanyCreatedCourses = function (req, res) {

  var id = req.params.id || req.query.id;

  Course.listCompanyCreatedCourses(id, function (err, courses) {
    if (err) {
      return res.json(500, "Error");
    }
    return res.json(200, courses);
  });
};

/**
 * listCompanyCourses
 -----
 *
 */

var listCompanyCourses = function (req, res) {

  var id = req.params.id || req.query.id;

  async.parallel([

      function (callback) {
        Tier.listTierCourses(id, function (err, courses) {
          callback(err, courses);
        });
      },
      function (callback) {
        Course.listCompanyCourses(id, function (err, courses) {
          callback(err, courses);
        });
      }
    ],
    function (err, results) {
      if (err) {
        return res.json(500, "Error");
      }

      var tiersCourses = results[0];
      var companyCourses = results[1];

      //-- Check if private course is already set to tier
      var unionArr = _.union(tiersCourses, companyCourses);

      var uniques = _.map(_.groupBy(unionArr, function (doc) {
        return doc._id;
      }), function (grouped) {
        return grouped[0];
      });

      return res.json(200, uniques);

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

  var query = {
    "_id": req.params.id || req.body.id
  };

  var update = {
    $set: {
      disabled: true
    }
  };

  Course.findOneAndUpdate(query, update, function (err, metadata) {
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
  listCompanyCreatedCourses: listCompanyCreatedCourses,
  listTiersCourses: listTiersCourses,
  listCompanyCourses: listCompanyCourses,
  find: find,
  create: create,
  update: update,
  destroy: destroy
};
