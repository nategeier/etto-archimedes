"use strict";

var app = require("../../index"),
  request = require("supertest");

var async = require("async"),
  routes = require("../routes.json");

var Tier = require("../../lib/models/Tier");

var createAndTestTier = require("../helpers").createAndTestFrom(routes.tier.collection),
  createAndTestUser = require("../helpers").createAndTestFrom(routes.user.collection),
  createAndTestCourse = require("../helpers").createAndTestFrom(routes.course.collection);

var removeTier = require("../helpers").removeFrom(routes.tier.collection),
  removeUser = require("../helpers").removeFrom(routes.user.collection),
  removeCourse = require("../helpers").removeFrom(routes.course.collection),
  removeRecord = require("../helpers").removeFrom(routes.record.collection);

var parentTier = require("./data/parentTier"),
  childTier = require("./data/childTier1"),
  user = require("./data/user"),
  record1 = require("./data/record"),
  course = require("./data/course");

var agent = request.agent(app);

var testSetUp = function (done) {

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
            callback(err, res.body);
          });
      },

      function (tier, callback) {
        //--- Create a user in the child tier

        user._tier = tier._id;
        //user._company = parentTier._id;
        user.code = "ettoCourse";
        agent
          .post("/user/saveNewUser")
          .send(user)
          .expect("Content-Type", /json/)
          .expect(200)
          .end(function (err, res) {
            user = res.body;
            callback(err);
          });
      },

      function (callback) {

        //--- Adds child tier, need to go to controller to handle popping in the ancesstors
        agent
          .post("/auth/local")
          .set("Accept", "application/json")
          .send(user)
          .expect("Content-Type", /json/)
          .expect(200)
          .end(function (err, res) {
            callback(err);
          });
      },
      function (callback) {
        //--- Create a courses

        course._creator = parentTier._id;

        createAndTestCourse(course, function (result) {
          course = result;
          callback(null, course);
        });
      },
      function (course, callback) {
        Tier.addCourseAllDescendants(parentTier._id, course._id, function (err, result) {
          callback(err, course);
        });
      }
      /*,
      function (course, callback) {
        console.log("createdUser------", user)
        //--- Adds child tier, need to go to controller to handle popping in the ancesstors
        agent
          .get("/record/create/" + user._id + "?courseId=" + course._id)
          .set("Accept", "application/json")
          .expect("Content-Type", /json/)
          .expect(200)
          .end(function (err, res) {
            callback(null, null);
          });
      },*/
    ],
    function (err, results) {
      done(err, results);
    });
};

beforeEach(function (done) {
  testSetUp(function (err, results) {
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
  course: course,
  agent: agent
};
