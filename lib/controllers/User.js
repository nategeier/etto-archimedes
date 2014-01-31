/**
 * CourseMeta Controllers
 *
 * @module      controllers/CourseMeta
 * @description Controllers for the CourseMeta resource
 */
"use strict";

var log = require("npmlog");

var User = require("../models/User"),
  Course = require("../models/Course"),
  Report = require("../models/Report"),
  Tier = require("../models/Tier"),
  async = require("async"),
  email = require("../services/email");

/**
 * Update users tier. Mainly for first time logins
 -----
 *
 */

var listUsersInTier = function (req, res) {

  var query = {};
  var id = req.params.id || req.query.id;
  if (id) {
    query = {
      "_tier": id
    };
  }

  User.find(query, function (err, tier) {

    if (tier && tier.length === 0 && id) {
      return res.json(200, []);
    }
    // If searching by ID return the bare object
    if (id) {
      return res.json(200, tier);
    }
    // Otherwise return the array of found objects
    return res.json(200, tier);
  });
};

var updateUsersTier = function (req, res) {
  var query = {};
  var set = {};

  var userID = req.body.userID || req.query.userID;
  var tierID = req.body.tierID || req.query.tierID;

  if (userID && tierID) {
    query = {
      "_id": userID
    };

    set = {
      "$set": {
        "_tier": tierID
      }
    };
  }

  User.update(query, set, function (err, results) {
    return res.json(202);
  });
};

/**
 * Invite user via email to join a tier
 -----
 *
 */

var inviteUser = function (req, res) {

  var user = req.body;

  async.waterfall([

      function (callback) {

        var newUser = new User({
          name: user.name,
          email: user.email,
          _tier: user._tier,
          meta: {
            votes: 1,
            favs: 1
          }
        });

        newUser.save(function (err, user) {
          callback(err, user);
        });
      },
      function (user, callback) {

        Report.getCourseReportsForTier(user._tier, function (err, reports) {
          callback(err, reports, user);
        });

      },
      function (reports, user, callback) {

        Tier.ancestors(user._tier, function (err, tier) {
          var ancestors = tier.ancestors;

          ancestors.push(user._tier);

          async.map(ancestors, function (tierId, callback) {

              async.map(reports, function (report, callback) {
                  Report.addUser(tierId, report._course._id, user._id, function (err, results) {
                    callback(err, results);
                  });
                },
                function (err, results) {
                  callback(err, results);
                });
            },

            function (err, results) {
              callback(err, user);
            });
        });

      }
    ],

    function (err, result) {
      return res.json(200, result);
    });
};

/**
 * List all users data
 -----
 *
 */
var fullDetails = function (req, res) {
  // TODO: Validation

  var query = {};
  var id = req.params.id || req.query.id;

  if (id) {
    query = {
      "_id": id
    };
  }

  User.findOne({
    "_id": id
  }).populate("_tier").exec(function (err, user) {
    // Otherwise return the array of found objects
    return res.json(200, user);
  });
};

var update = function (req, res) {
  // TODO: Validation

  var user = req.body;
  user._tier = user._tier._id;

  var id = user._id;

  User.findOneAndUpdate({
    "_id": id
  }, {
    $set: {
      name: user.name,
      email: user.email,
      auth: user.auth

    }
  }, function (err, user) {
    // Otherwise return the array of found objects
    return res.json(200, user);
  });
};

/**
 * List all created courses a user created
 -----
 *
 */
var listUsersCreatedCourses = function (req, res) {
  // TODO: Validation

  var userID = req.body._id;

  Course.find({
    _creators: userID
  }, function (err, courses) {

    if (err) {
      log.error("req", err);
      return res.json(500, "Error");
    }
    /*
    if (courses && !courses[0]) {
      return res.json(404, "Not Found");
    }*/
    return res.json(200, courses);
  });
};

var destroy = function (req, res) {
  // TODO: Validation

  var userID = req.body._id;

  User.remove({
    _id: userID
  }, function (err, user) {

    if (err) {
      log.error("req", err);
      return res.json(500, "Error");
    }
    /*
    if (courses && !courses[0]) {
      return res.json(404, "Not Found");
    }*/
    return res.json(200);
  });
};

module.exports = {
  update: update,
  fullDetails: fullDetails,
  listUsersInTier: listUsersInTier,
  updateUsersTier: updateUsersTier,
  inviteUser: inviteUser,
  listUsersCreatedCourses: listUsersCreatedCourses,
  destroy: destroy
};
