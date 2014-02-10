"use strict";

var app = require("../../index"),
  request = require("supertest");

var async = require("async"),
  mongoose = require("mongoose"),
  routes = require("../routes.json");

var Tier = require("../../lib/models/Tier");

var createAndTestTier = require("../helpers").createAndTestFrom(routes.tier.collection),
  createAndTestReport = require("../helpers").createAndTestFrom(routes.report.collection),
  createAndTestUser = require("../helpers").createAndTestFrom(routes.user.collection),
  createAndTestCourse = require("../helpers").createAndTestFrom(routes.course.collection),
  createAndTestRecord = require("../helpers").createAndTestFrom(routes.record.collection);

var removeTier = require("../helpers").removeFrom(routes.tier.collection),
  removeUser = require("../helpers").removeFrom(routes.user.collection),
  removeCourse = require("../helpers").removeFrom(routes.course.collection),
  removeRecord = require("../helpers").removeFrom(routes.record.collection),
  removeReport = require("../helpers").removeFrom(routes.report.collection);

var parentTier = require("./data/parentTier"),
  childTier = require("./data/childTier1"),
  user = require("./data/user"),
  record = require("./data/record"),
  course = require("./data/course"),
  report = null;

beforeEach(function (done) {
  testSetUp(parentTier, childTier, course, user, record, function (err, results) {
    report = results;
    done();
  });
});

afterEach(function () {
  removeReport(report);
  removeUser(user);
  removeRecord(record);
  removeCourse(course);
  removeTier(childTier);
  removeTier(parentTier);
});

var testSetUp = function (parentTier, childTier, course, user, record, done) {

  var report = {};

  async.waterfall([

      function (callback) {
        //--- Adds initial tier
        createAndTestTier(parentTier, function (result) {
          parentTier = result;
          callback(null, result);
        });
      },
      function (parentTier, callback) {

        childTier.parent = parentTier._id;

        //--- Adds child tier, need to go to controller to handle popping in the ancesstors
        request(app)
          .post("/tier/add")
          .send(childTier)
          .expect("Content-Type", /json/)
          .expect(200)
          .end(function (err, res) {
            childTier._id = res.body._id;
            callback(null);
          });
      },

      function (callback) {

        var _tier = childTier._id;
        if (typeof _tier === "string") {
          _tier = new mongoose.Types.ObjectId(_tier);
        }
        user._tier = _tier;
        createAndTestUser(user, function (result) {
          user = result;
          callback(null, user);
        });
      },
      function (user, callback) {

        //--- Create a courses
        createAndTestCourse(course, function (result) {
          callback(null, course);
        });
      },
      function (course, callback) {

        Tier.descendants(parentTier._id, function (err, results) {

          async.map(results, function (tier) {

              report = {
                _tier: tier._id,
                _course: course._id,
                _completed: [],
                _notCompleted: [user._id]
              };

              createAndTestReport(report, function (results) {
                report = results;
                callback(null, course);
              });

            },
            function (err, result) {
              callback(null, course);
            });

        });

      },
      function (course, callback) {

        Tier.addCourseAllDescendants(parentTier._id, course._id, function (err, result) {
          callback(err);
        });
      },
      function (callback) {

        record._user = user._id;
        record._course = course._id;
        createAndTestRecord(record, function (result) {
          callback(null, result);
        });
      }

    ],
    function (err, results) {
      done(err, report);
    });
};

module.exports = {
  parentTier: parentTier,
  childTier: childTier,
  user: user,
  record: record,
  course: course,
  report: report
}