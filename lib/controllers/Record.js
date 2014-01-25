"use strict";

var log = require("npmlog");

var async = require("async"),
  Course = require("../models/Course"),
  Tier = require("../models/Tier"),
  User = require("../models/User"),
  Record = require("../models/Record");

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

            console.log('result-4$$$$$$$$$$$$$$-----', result)
            callback(err, result);
          });

      }
      /*,
      function (courses, callback) {

        console.log('courses----------', courses)
        Record.find({
            _id: {
              $in: courses
            }
          }, 'title price subtitle',
          function (err, courses) {
            console.log('courses-ppppppp', courses);
            callback(err, courses);
          });
      }*/

    ],

    function (err, result) {
      console.log('err----------', err)
      if (err) {
        log.error("req", err);
        return res.json(500, err);
      }
      return res.json(200, result);

    });

};

module.exports = {
  countCoursesRecordsInTier: countCoursesRecordsInTier
};
