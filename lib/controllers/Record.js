"use strict";

var log = require("npmlog");

var async = require("async"),
  Tier = require("../models/Tier"),
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
              Tier.descendants(tierID, function (err, result) {
                callback(err, result);
              });
            }
          ],

          function (err, results) {

            var courses = results[0],
              descendants = results[1];

            callback(err, courses, descendants);

          });

      },
      function (courses, descendants, callback) {

        callback(null, descendants);

        Tier
          .find({
            _id: {
              $in: descendants
            }
          })
          .where({
            _courses: {
              $in: courses
            }
          })
          .exec(function (err, result) {
            callback(err, result);
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
  completed: completed,
  countCoursesRecordsInTier: countCoursesRecordsInTier
};