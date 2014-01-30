var app = require("../../index"),
  assert = require("assert"),
  async = require("async"),
  request = require("supertest"),
  routes = require("../routes.json"),
  env = require("../fixtures/testSetUp");

var removeTier = require("../helpers").removeFrom(routes.tier.collection),
  removeUser = require("../helpers").removeFrom(routes.user.collection),
  removeCourse = require("../helpers").removeFrom(routes.course.collection),
  removeRecord = require("../helpers").removeFrom(routes.record.collection),
  removeReport = require("../helpers").removeFrom(routes.report.collection);

describe("Tier", function () {
  describe("POST " + routes.tier.path, function () {

    it("should add a tier", function (done) {

      var parentTier = require("../fixtures/parentTier"),
        childTier = require("../fixtures/childTier1"),
        usaTier = require("../fixtures/usaTier"),
        user = require("../fixtures/user"),
        record = require("../fixtures/record"),
        course = require("../fixtures/course"),
        report = null;

      async.waterfall([
          function (callback) {
            //--- Adds initial tier
            env.intTestSetup(parentTier, childTier, course, user, record, function (err, results) {
              report = results;
              callback(null);
            });
          },
          function (callback) {

            usaTier.parent = childTier._id;

            request(app)
              .post("/tier/add")
              .send(usaTier)
              .expect("Content-Type", /json/)
              .expect(200)
              .end(function (err, res) {

                assert.equal(res.body.title, usaTier.title);
                usaTier._id = res.body._id;
                callback(null);
              });

          }
        ],
        function (err, results) {
          removeReport(report);
          removeUser(user);
          removeRecord(record);
          removeCourse(course);
          removeTier(childTier);
          removeTier(usaTier);
          removeTier(parentTier);
          done();
        });

    });

    it("should list all children and counts users and all tiers", function (done) {

      var parentTier = require("../fixtures/parentTier"),
        childTier = require("../fixtures/childTier1"),
        user = require("../fixtures/user"),
        record = require("../fixtures/record"),
        course = require("../fixtures/course"),
        report = null;

      async.waterfall([
          function (callback) {
            //--- Adds initial tier
            env.intTestSetup(parentTier, childTier, course, user, record, function (err, results) {
              report = results;
              callback(null);
            });
          },
          function (callback) {

            request(app)
              .post("/tier/list_children_and_count_users")
              .send(parentTier)
              .expect("Content-Type", /json/)
              .expect(200)
              .end(function (err, res) {
                assert.equal(res.body[0].totUsers, 1);
                callback(null);
              });
          }
        ],
        function (err, results) {
          removeReport(report);
          removeUser(user);
          removeRecord(record);
          removeCourse(course);
          removeTier(childTier);
          removeTier(parentTier);
          done();
        });

    });

    it("should remove tier and all its children", function (done) {

      var parentTier = require("../fixtures/parentTier"),
        childTier = require("../fixtures/childTier1"),
        usaTier = require("../fixtures/usaTier"),
        user = require("../fixtures/user"),
        record = require("../fixtures/record"),
        course = require("../fixtures/course"),
        report = null;

      async.waterfall([
          function (callback) {
            //--- Adds initial tier
            env.intTestSetup(parentTier, childTier, course, user, record, function (err, results) {
              report = results;
              callback(null);
            });
          },
          function (callback) {

            request(app)
              .post("/tier/remove")
              .send(parentTier)
              .expect("Content-Type", /json/)
              .expect(200)
              .end(function (err, res) {
                assert.equal(res.body, 200);
                callback(null);
              });

          }
        ],
        function (err, results) {
          removeReport(report);
          removeUser(user);
          removeRecord(record);
          removeCourse(course);
          removeTier(childTier);
          removeTier(parentTier);
          done();
        });

    });

    it("should list all courses in tier", function (done) {

      var parentTier = require("../fixtures/parentTier"),
        childTier = require("../fixtures/childTier1"),
        usaTier = require("../fixtures/usaTier"),
        user = require("../fixtures/user"),
        record = require("../fixtures/record"),
        course = require("../fixtures/course"),
        report = null;

      async.waterfall([
          function (callback) {
            //--- Adds initial tier
            env.intTestSetup(parentTier, childTier, course, user, record, function (err, results) {
              report = results;
              callback(null);
            });
          },
          function (callback) {

            request(app)
              .post("/course/listTiersCourses")
              .send(childTier)
              .expect("Content-Type", /json/)
              .expect(200)
              .end(function (err, res) {
                //assert.equal(res.body, 200);
                callback(null);
              });
          }
        ],
        function (err, results) {
          removeReport(report);
          removeUser(user);
          removeRecord(record);
          removeCourse(course);
          removeTier(childTier);
          removeTier(parentTier);
          done();
        });

    });
  });
});
