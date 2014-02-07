"use strict";

var log = require("npmlog");

var async = require("async"),
  mongoose = require("mongoose"),
  Tier = require("../models/Tier"),
  Record = require("../models/Record"),
  User = require("../models/User"),
  Report = require("../models/Report");

var completed = function (req, res) {

  var userId = req.body.userId,
    tierId = req.body.tierId,
    courseId = req.body.courseId;

  Tier.ancestors(tierId, function (err, tier) {
    var ancestors = tier.ancestors;

    ancestors.push(tierId);

    async.map(ancestors, function (tierId, callback) {

        Report.completed(tierId, courseId, userId, function (err, results) {
          callback(err, results);
        });
      },

      function (err, results) {
        return res.json(200, results);
      });
  });
};

var create = function (req, res) {

  var userId = req.params.userId || req.query.userId,
    courseId = req.params.courseId || req.query.courseId;

  Record.create(userId, courseId, function (err, results) {
    return res.json(200, results);
  });
};

var countCoursesRecordsInTier = function (req, res) {

  var tierID = req.body._id;

  async.waterfall([

      function (callback) {
        async.parallel([

            function (callback) {
              Tier.findOne({
                _id: tierID
              }, function (err, result) {

                callback(err, result._courses);
              });
            },
            function (callback) {
              Tier.descendantsIds(tierID, function (err, result) {
                callback(err, result);
              });
            }
          ],

          function (err, results) {

            var courses = results[0],
              tiers = results[1];

            if (typeof tierID === "string") {
              tierID = new mongoose.Types.ObjectId(tierID);
            }

            tiers.push({
              _id: tierID
            });

            callback(err, courses, tiers);

          });

      },
      function (courses, tiers, callback) {

        console.log("courses!!!!!!-------------------------------", courses);

        Tier
          .find({
            _id: {
              $in: tiers
            }
          })
          .where({
            _courses: {
              $in: courses
            }
          })
          .exec(function (err, tiers) {
            callback(err, tiers, courses);
          });

      },
      /*
      function (tiers, courses, callback) {
        Report.findOrCreate(tierID, )
      },
  */
      function (tiers, courses, callback) {
        console.log("run!!!!!!-------------------------------", courses);
        var tierReport = {
          courses: []
        };

        async.map(courses, function (course, callback) {

          async.map(tiers, function (tier, callback) {

            async.map(tier._courses, function (_course, callback) {
                if (course._id === _course._id) {

                  User.getUsersInTier(tier._id, function (err, users) {
                    //console.log("yes!!!!!!-------------------------------", users);

                    async.map(users, function (user) {
                        Record.checkIfCompleted(user._id, course._id, function (err, results) {
                          if (results) {
                            tierReport.courses.push({
                              completed: user
                            });
                          } else {
                            tierReport.courses.push({
                              notCompleted: user
                            });
                          }
                          callback(null, null);
                        });
                      },
                      function (err, results) {
                        callback(null, null);
                      });

                  });

                } else {
                  callback(null, null);
                }

              },
              function (err, results) {
                callback(null, null);
              });

          }, function (err, results) {
            callback(null, tierReport);
          });

        }, function (err, results) {
          console.log("hmmmmm-------------------------------", results);
          callback(null, tierReport);
        });

      }

    ],

    function (err, result) {
      if (err) {
        log.error("req", err);
        return res.json(500, err);
      }
      return res.json(200, result);

    });
};

module.exports = {
  create: create,
  completed: completed,
  countCoursesRecordsInTier: countCoursesRecordsInTier
};
