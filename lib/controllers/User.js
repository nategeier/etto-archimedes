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
  Tier = require("../models/Tier"),
  async = require("async"),
  bcrypt = require("bcrypt"),
  email = require("../services/email");

var config = require("../server/config"),
  baseUrl = "localhost:9010";

/**
*List all users in a tier
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

/**
 * Update users tier. Mainly for first time logins
 -----
 Verifys the users infomraiton is correct afte single sign on
 *
 */

var updateUsersTier = function (req, res) {

  var user = req.body;
  //var id = user._id || 0;

  async.waterfall([

      function (callback) {
        User.checkUsernameExists(user.username, function (err, user) {
          if (user) {
            err = {};
            err.err = "Username already exists";
            callback(err);
          } else {
            callback(err);
          }
        });
      },

      function (callback) {
        bcrypt.genSalt(10, function (err, salt) {
          bcrypt.hash(user.password, salt, function (err, hash) {
            callback(err, salt, hash);
          });
        });
      },
      function (salt, hash, callback) {

        var update = {
          "$set": {
            "name": user.name,
            "_tier": user._tier,
            "enabled": true,
            "username": user.username,
            "hash": hash

          },
          "$addToSet": {
            "email": user.email
          }
        };

        User.findOneAndUpdate({
          "_id": user._id
        }, update, {
          upsert: true
        }).populate("_tier").exec(function (err, user) {
          req.session.user = user;
          console.log("results------", user);
          callback(err, user);
        });
      }
    ],
    function (err, result) {
      if (err) {
        console.log("req", err);
        return res.json(500, err);
      }
      console.log("req.session.user ------", req.session.user);
      return res.json(200, result);
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
          email: user.email,
          _tier: user._tier,
          auth: user.auth,
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
        Tier.findCompany(user._tier, function (err, company) {
          callback(err, user, company);
        });

      },
      function (user, company, callback) {

        var htmlTxt = "<p>You have been invited to start " + company.title + " training courses</p>";
        htmlTxt += "<a href='http://" + baseUrl + "/invited/" + user._id + "'>Click to Register</a>";

        email.sendMail("Invitation to " + company.title + " training", htmlTxt, user.email, "toPerson", function (err, results) {
          callback(err, user);
        });
      }

    ],

    function (err, result) {
      if (err && err.code === 11000) {
        console.log("req", err);
        err.err = "This email already exists in the system."
        return res.json(200, err);
      } else if (err) {
        return res.json(500, err);
      }
      console.log(result)
      return res.json(200, result);
    });
};

/**
 * List all users data
 -----
 *
 */
var fullDetails = function (req, res) {

  var id = req.params.id || req.query.id;

  async.waterfall([

      function (callback) {

        User.findOne({
          "_id": id
        }).populate("_tier").exec(function (err, user) {
          callback(err, user);
        });
      }

    ],
    function (err, results) {
      if (err) {
        log.error("req", err);
        return res.json(500, err);
      }
      return res.json(200, results);
    });
};

var update = function (req, res) {

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
    if (err) {
      log.error("req", err);
      return res.json(500, err);
    }
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

  var id = req.params.id || req.query.id;

  Course.find({
    _creators: id
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

/**
 * Removes a User
 -----
 *
 */

var destroy = function (req, res) {
  // TODO: Validation

  var userID = req.body._id;

  User.remove({
    _id: userID
  }, function (err) {

    if (err) {
      log.error("req", err);
      return res.json(500, "Error");
    }
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
