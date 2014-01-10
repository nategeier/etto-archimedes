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
  async = require('async'),
  email = require("../services/email");

/**
 * Update users tier. Mainly for first time logins
 -----
 *
 */

var update_users_tier = function (req, res) {
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
    }
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
var invite_user = function (req, res) {
  async.waterfall([

      function (callback) {

        var new_user = new User({
          name: user.name,
          email: user.email,
          _tier: user._tier,
          meta: {
            votes: 1,
            favs: 1
          }
        });

        new_user.save(function (err, user) {
          callback(err, user);
        });
      },
      function (user, callback) {
        email.sendMail("Join Coursetto", "<b>You have been invited to join the team</b><a href='http://localhost:9010/#/register_invite/" + user._id + "'> Enroll Here</a>", user.email, user.name, function (err, response) {
          callback(err, user)
        })
      }
    ],

    function (err, result) {
      return res.json(200, result);
    });
};

/**
 * List all created courses a user created
 -----
 *
 */
var list_users_created_courses = function (req, res) {
  // TODO: Validation

  var userID = req.body._id;

  Course.find({
    _creators: userID
  }, function (err, courses) {
    console.log(courses)

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

module.exports = {
  update_users_tier: update_users_tier,
  invite_user: invite_user,
  list_users_created_courses: list_users_created_courses
};
