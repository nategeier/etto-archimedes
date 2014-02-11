"use strict";

var log = require("npmlog");

var async = require("async"),
  mongoose = require("mongoose"),
  Tier = require("../models/Tier"),
  Record = require("../models/Record"),
  User = require("../models/User");

/*
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
*/
var create = function (req, res) {

  var userId = req.params.userId || req.query.userId,
    courseId = req.params.courseId || req.query.courseId;

  Record.create(userId, courseId, function (err, results) {
    return res.json(200, results);
  });
};

var tier = function (req, res) {

  var tierId = req.params.id || req.query.id;

  async.waterfall([

      function (callback) {
        async.parallel([

            function (callback) {
              Tier.findOne({
                _id: tierId
              }, "title _courses").populate("_courses", "title").exec(function (err, result) {
                callback(err, result._courses);
              });
            },
            function (callback) {
              Tier.descendants(tierId, function (err, tiers) {
                callback(err, tiers);

              });
            },

          ],

          function (err, results) {

            var courses = results[0],
              tiers = results[1];
            /*
            if (typeof tierId === "string") {
              tierId = new mongoose.Types.ObjectId(tierId);
            }
            tiers.push({
              _id: tierId
            });
            */
            callback(err, courses, tiers);
          });

      },

      function (courses, tiers, callback) {

        User.getLowerUsers(tiers, function (err, users) {

          callback(err, courses, tiers, users);

        });

      },

      function (courses, tiers, users, callback) {

        console.log("courses-------------------------------", courses);
        console.log("tiers-------------------------------", users);

        var report = {
          totalUser: 0,
          courses: []
        }

        var index = 0;

        async.map(courses, function (course, callback) {

            report.courses.push({
              _id: course._id
            });

            async.waterfall([
                /*
                function (callback) {
                  //callback(null, null);
                  Record.getAllUsersCourseRecords(users, course._id, function (err, results) {
                    callback(err, results);
                  });

                },*/
                function (callback) {
                  Tier.listAllTiersWithCourse(tiers, setup.course._id, function (err, results) {
                    console.log("end time------", results);
                    callback(err, results);
                  });
                },
                function (tiers, callback) {
                  User.getUsersInTiers(tiers, function (err, results) {
                    report.courses[index].totalUser = results.length;
                    callback(err, results);
                  });

                }
              ],

              function (err, results) {

                callback(null, null);
              });

          },

          function (err, results) {
            console.log("hmmmmm-------------------------------", report);
            callback(null, results);
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
  tier: tier
};
