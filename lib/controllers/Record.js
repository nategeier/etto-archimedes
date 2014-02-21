"use strict";

var log = require("npmlog");

var async = require("async"),
  Tier = require("../models/Tier"),
  Record = require("../models/Record"),
  Credit = require("../models/Credit"),
  Course = require("../models/Course"),
  User = require("../models/User");

/**
 * Create Record
 *
 */

var create = function (req, res) {

  var userId = req.params.userId || req.query.userId || req.body.userId,
    courseId = req.params.courseId || req.query.courseId || req.body.courseId;

  async.waterfall([
      function (callback) {
        async.parallel([
          function (callback) {
            User.getUserTier(userId, function (err, user) {
              callback(err, user);
            });
          },
          function (callback) {
            Record.userBestCourseRecord(userId, courseId, function (err, record) {
              callback(err, record);
            });

          },
        ], function (err, results) {
          callback(err, results[0], results[1]);
        });
      },
      function (tier, record, callback) {
        //console.log(record)
        if (record) {

          Record.create(userId, courseId, tier._tierId, record.progress, function (err, results) {
            callback(err, results);
          });

        } else {

        }

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

var useCredits = function (companyId, userId, courseId, done) {

  Course.getPriceAndCreator(courseId, function (err, course) {

    async.parallel([

        function (callback) {
          Credit.useCedits(companyId, userId, courseId, course.price, function (err, results) {
            callback(err);
          });
        },
        function (callback) {
          Credit.useCedits(companyId, userId, courseId, course.price, function (err, results) {
            callback(err);
          });

        }
      ],
      function (err, results) {
        done(err, results);
      });
  });

};
/**
 * Update Bookmark
 *
 */

var updateBookmark = function (req, res) {

  var id = req.params.id || req.query.id,
    bookmark = req.params.bookmark || req.query.bookmark,
    totalBlocks = req.params.totalBlocks || req.query.totalBlocks;

  Record.updateBookmark(id, bookmark, totalBlocks, function (err, results) {
    if (err) {
      log.error("req", err);
      return res.json(500, err);
    }
    return res.json(200, results);
  });
};

/**
 * tierReport
 *
 */

var tierReport = function (req, res) {

  var tierId = req.params.id || req.query.id;

  var report = {
    totalUsers: 0,
    totalToTake: 0,
    totalTaken: 0,
    title: "",
    _id: "",
    courses: []
  };

  async.waterfall([

      function (callback) {
        async.parallel([

            function (callback) {
              Tier.findOne({
                _id: tierId
              }, "title _courses").populate("_courses", "title").exec(function (err, result) {
                report.title = result.title;
                report._id = result._id;
                callback(err, result);
              });
            },
            function (callback) {
              Tier.descendants(tierId, function (err, tiers) {
                callback(err, tiers);
              });
            },
          ],

          function (err, results) {

            var courses = results[0]._courses,
              tiers = results[1];

            tiers.push(results[0]);
            callback(err, courses, tiers);
          });

      },

      function (courses, tiers, callback) {

        User.getLowerUsers(tiers, function (err, users) {
          callback(err, courses, tiers, users);
        });

      },

      function (courses, tiers, users, callback) {

        var index = 0;

        report.totalUsers = users.length;

        async.map(courses, function (course, callback) {

            report.courses.push({
              _id: course._id,
              title: course.title,
              completed: [],
              notCompleted: []
            });

            async.waterfall([

                function (callback) {
                  Tier.listAllTiersWithCourse(tiers, course._id, function (err, results) {
                    callback(err, results);
                  });
                },
                function (tiers, callback) {
                  User.getUsersInTiers(tiers, function (err, results) {
                    report.courses[index].totalUser = results.length;
                    report.totalToTake += results.length;
                    callback(err, results);
                  });
                },
                function (usersInLowerTear, callback) {

                  async.map(usersInLowerTear, function (user, callback) {

                      Record.checkIfCompleted(user._id, course._id, function (err, results) {
                        if (results) {
                          report.courses[index].completed.push(user);
                          report.totalTaken++;
                        } else {
                          report.courses[index].notCompleted.push(user);

                        }
                        callback(err, results);
                      });

                    },
                    function (err, results) {
                      callback(err, results);
                    });
                }
              ],

              function (err, results) {
                index++;
                callback(err, null);
              });

          },

          function (err, results) {

            callback(null, results);
          });

      }

    ],

    function (err, result) {
      if (err) {
        log.error("req", err);
        return res.json(500, err);
      }
      return res.json(200, report);

    });
};

module.exports = {
  create: create,
  updateBookmark: updateBookmark,
  tierReport: tierReport
};
