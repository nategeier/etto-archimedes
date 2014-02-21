"use strict";

var app = require("../../index"),
  request = require("supertest");

var async = require("async"),
  mongoose = require("mongoose"),
  routes = require("../routes.json");

var Tier = require("../../lib/models/Tier"),
  Record = require("../../lib/models/Record");

var createAndTestTier = require("../helpers").createAndTestFrom(routes.tier.collection),
  createAndTestReport = require("../helpers").createAndTestFrom(routes.report.collection),
  createAndTestUser = require("../helpers").createAndTestFrom(routes.user.collection),
  createAndTestCourse = require("../helpers").createAndTestFrom(routes.course.collection);

var removeTier = require("../helpers").removeFrom(routes.tier.collection),
  removeUser = require("../helpers").removeFrom(routes.user.collection),
  removeCourse = require("../helpers").removeFrom(routes.course.collection),
  removeRecord = require("../helpers").removeFrom(routes.record.collection);

var parentTier = require("./data/parentTier"),
  childTier = require("./data/childTier1"),
  user = require("./data/user"),
  record1 = {},
  course = require("./data/course");

var testSetUp = function (parentTier, childTier, course, user, record, done) {

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
        childTier._company = parentTier._id;

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
        //--- Create a user in the child tier
        var _tier = childTier._id;
        if (typeof _tier === "string") {
          _tier = new mongoose.Types.ObjectId(_tier);
        }

        user._tier = _tier;
        user._company = parentTier._id;

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
        Tier.addCourseAllDescendants(parentTier._id, course._id, function (err, result) {
          callback(err);
        });
      },
      function (callback) {
        request(app)
          .get("/record/create/" + user._id + "?courseId=" + course._id)
          .expect("Content-Type", /json/)
          .expect(200)
          .end(function (err, res) {
            record1 = res.body;
            callback(null);
          });

      }

    ],
    function (err, results) {
      done(err, results);
    });
};

beforeEach(function (done) {
  testSetUp(parentTier, childTier, course, user, record1, function (err, results) {
    done();
  });
});

afterEach(function () {

  removeUser(user);
  removeRecord(record1);
  removeCourse(course);
  removeTier(childTier);
  removeTier(parentTier);
});

module.exports = {
  parentTier: parentTier,
  childTier: childTier,
  user: user,
  record1: record1,
  course: course
};
