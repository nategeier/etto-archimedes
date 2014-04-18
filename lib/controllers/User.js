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
  Record = require("../models/Record"),
  async = require("async"),
  bcrypt = require("bcrypt"),
  email = require("../services/email"),
  mongoose = require("mongoose");

var config = require("../server/config"),
  baseUrl = (config.get("baseurl"));

var betaCode = "ettoCourse";

/**
 * userDetailes
 -----
 *
 */

var userDetails = function (id, done) {
  User.findOne({
    "_id": id
  }).populate("_tier").exec(function (err, user) {
    done(err, user);
  });
};

/**
*listUsersCourseRecords
 -----
 *
 */

var listUserCoursesRecords = function (req, res) {

  var id = req.params.id || req.query.id;

  Record.getUsersRecords(id, function (err, records) {
    if (err) {
      return res.json(500, err);
    }

    return res.json(200, records);
  });
};

/**
*List all users in a tier
 -----
 *
 */

var searchUser = function (req, res) {

  var query = {};
  var searchTxt = req.params.text || req.query.text;

  User.searchUser(searchTxt, function (err, users) {
    if (err) {
      return res.json(500, err);
    }
    return res.json(200, users);
  });
};

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

  var id = null;

  if (user._id) {
    id = user._id;
  }

  var tierId = "0";

  if (typeof user._tier === "object") {
    tierId = user._tier._id;
  } else {
    tierId = user._tier;
  }

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
            "_tier": tierId,
            "enabled": true,
            "username": user.username,
            "hash": hash

          },
          "$addToSet": {
            "email": user.email[0]
          }
        };

        User.findOneAndUpdate({
          "_id": id
        }, update, {
          upsert: true
        }).populate("_tier").exec(function (err, user) {
          req.session.user = user;
          callback(err, user);
        });

      }
    ],

    function (err, result) {
      if (err) {
        return res.json(500, err);
      }
      return res.json(200, result);
    });
};

/**
 * Save new user in registraion
 -----
 *
 */

var saveNewUser = function (req, res) {

  var user = req.body;

  console.log(user)
  var id = null;

  if (user._id) {
    id = user._id;
  }

  var tierId = "0";

  if (typeof user._tier === "object") {
    tierId = user._tier._id;
  } else {
    tierId = user._tier;
  }

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
        User.checkEmailExists(user.email, function (err, user) {
          if (user) {
            err = {};
            err.err = "Email already exists";
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
        var isBeta = false;
        if (user.code === "ettoCourse") {
          isBeta = true;
        }

        var newUser = new User({
          "name": user.name,
          "_tier": tierId,
          "enabled": true,
          "username": user.username,
          "hash": hash,
          "email": user.email,
          "isBeta": isBeta
        });

        newUser.save(function (err, addedUser) {

          if (String(user.code) === String(betaCode)) {
            if (!req.session) {
              req.session = {};
            }

            userDetails(addedUser._id, function (err, results) {
              req.session.user = results;
              callback(err, addedUser);
            });

          } else {
            callback("beta");
          }

        });

      }
    ],

    function (err, result) {
      if (err && err === "beta") {
        result = {
          err: "Thanks for registering, looks like your bata code did not match, but we have your contact info and we'll send you an invite as soon as we can."
        };
        return res.json(200, result);
      } else if (err) {
        return res.json(500, err);
      }
      return res.json(200, result);
    });
};

var saveInvites = function (invites, company, done) {

  var passed = [];
  var rejected = [];

  async.map(invites.emails, function (newEmail, callback) {

    if (newEmail === "") {
      callback(null, null);
    } else {
      async.waterfall([

          function (callback) {
            User.checkEmailExists(newEmail, function (err, user) {
              if (user) {
                rejected.push(newEmail);
                callback(err, null);
              } else {
                passed.push(newEmail);
                callback(err, newEmail);
              }

            });
          },
          function (email, callback) {
            if (!email) {
              callback(null, null);
            } else {
              var newUser = new User({
                email: email,
                _tier: invites._tier,
                auth: invites.auth,
                isBeta: true
              });

              newUser.save(function (err, user) {
                callback(err, user);
              });
            }

          },
          function (user, callback) {
            if (!user) {
              callback(null, null);
            } else {
              var htmlTxt = "<p>You have been invited to start " + company.title + " training courses</p>";
              htmlTxt += "<a href='http://" + baseUrl + "/invited/" + user._id + "'>Click to Register</a>";

              email.sendMail("Invitation to " + company.title + " training", htmlTxt, user.email, "toPerson", function (err, results) {
                callback(err, user);
              });
            }

          }
        ],
        function (err, result) {
          callback(err, result);
        });

    }

  }, function (err, results) {

    results = {
      rejected: rejected,
      passed: passed
    };

    done(err, results);
  });
};

/**
 * Invite user via email to join a tier
 -----
 *
 */

var inviteUser = function (req, res) {

  var invites = req.body;

  async.waterfall([

      function (callback) {
        Tier.findCompany(invites._tier, function (err, company) {
          callback(err, company);
        });
      },
      function (company, callback) {
        saveInvites(invites, company, function (err, results) {
          callback(err, results);
        });
      }
    ],
    function (err, results) {
      if (err) {
        return res.json(500, err);
      }
      return res.json(200, results);
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
      },
      function (user, callback) {
        //console.log(user)
        var tierToCheck = String(user._tier._id);
        var userTierId = String(req.session.user._tier._id);

        if (tierToCheck !== userTierId) {
          Tier.checkTierIsLower(tierToCheck, userTierId, function (err, hasAuth) {
            if (!hasAuth) {
              callback(401);
            }
            callback(err, user);
          });
        } else {
          callback(null, user);
        }
      },

    ],
    function (err, results) {

      if (err === 401) {
        return res.json(401, "err");
      } else if (err) {
        return res.json(500, err);
      }
      return res.json(200, results);
    });
};

var update = function (req, res) {

  var user = req.body;

  if (typeof user._tier._id === "string") {
    user._tier = new mongoose.Types.ObjectId(user._tier._id);
  }

  if (!user.name) {
    user.name = "";
  }

  var id = user._id;

  User.findOneAndUpdate({
    "_id": id
  }, {
    $set: {
      name: user.name,
      auth: user.auth,
      avatarUrl: user.avatarUrl,
      _tier: user._tier
    },
    $addToSet: {
      email: user.email[0]
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
 * Get users courses and greatest progress
 *
 */

var listUsersCourses = function (req, res) {

  var userId = req.params.id || req.query.id;

  async.waterfall([

      function (callback) {
        User.findOne({
          _id: userId
        }, "_tier", function (err, results) {
          callback(err, results._tier);
        });
      },
      function (tierId, callback) {
        Tier.listTierCourses(tierId, function (err, results) {
          callback(err, results);
        });
      },
      function (courses, callback) {

        async.map(courses, function (course, callback) {

            Record.userBestCourseRecord(userId, course._id, function (err, results) {
              console.log(results)
              course._record = results;
              callback(err, results);
            });
          },
          function (err, results) {
            callback(err, courses);
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
  listUserCoursesRecords: listUserCoursesRecords,
  searchUser: searchUser,
  update: update,
  saveNewUser: saveNewUser,
  fullDetails: fullDetails,
  listUsersInTier: listUsersInTier,
  updateUsersTier: updateUsersTier,
  inviteUser: inviteUser,
  listUsersCourses: listUsersCourses,
  destroy: destroy
};
