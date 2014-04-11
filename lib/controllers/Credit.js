"use strict";

var log = require("npmlog");

var async = require("async"),
  Use = require("../models/credits/Use"),
  Purchase = require("../models/credits/Purchase"),
  Payment = require("../models/credits/Payment"),
  Course = require("../models/Course");

/**
 * companyCreditsUsed
 ----- 
 *
 */

var companyCreditsUsed = function (req, res) {

  var id = req.params.id || req.query.id;

  var report = {
    courses: [],
    overallUsed: 0
  };

  async.waterfall([

      function (callback) {
        Use.companyCredits(id, function (err, results) {
          callback(err, results);
        });
      },
      function (courses, done) {

        async.map(courses, function (course, callback) {
          report.overallUsed += course.total;

          Course.courseTitle(course._id, function (err, result) {

            report.courses.push({
              _courseId: result._id,
              title: result.title,
              used: course.total
            });
            callback(err, result);

          });
        }, function (err, results) {
          done(err, results);
        });
      }
    ],
    function (err, results) {
      if (err) {
        return res.json(500, err);
      }
      // Otherwise return the array of found objects
      return res.json(200, report);
    });
};

/**
 * companyCreditsUsed
 ----- 
 *
 */

var companyPurchases = function (req, res) {

  var id = req.params.id || req.query.id;

  async.waterfall([

      function (callback) {
        Purchase.companyPurchases(id, function (err, results) {
          callback(err, results);
        });
      }
    ],
    function (err, results) {
      if (err) {
        return res.json(500, err);
      }
      // Otherwise return the array of found objects
      return res.json(200, results);
    });
};

/**
 * companyRecieved
 ----- 
 *
 */

var companyRecieved = function (req, res) {

  var id = req.params.id || req.query.id;

  Payment.companyRecieved(id, function (err, results) {
    if (err) {
      return res.json(500, err);
    }
    // Otherwise return the array of found objects
    return res.json(200, results);
  });

};

/**
### Exports
 -----
 *
 */

module.exports = {
  companyCreditsUsed: companyCreditsUsed,
  companyPurchases: companyPurchases,
  companyRecieved: companyRecieved
};
