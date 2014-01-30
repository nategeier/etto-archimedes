var app = require("../../../index"),
  assert = require("assert"),
  async = require("async"),
  request = require("supertest"),
  routes = require("../../routes.json"),
  env = require("../../environment/envSetUp");

var Tier = require("../../../lib/models/Tier");

var removeTier = require("../../helpers").removeFrom(routes.tier.collection),
  removeUser = require("../../helpers").removeFrom(routes.user.collection),
  removeCourse = require("../../helpers").removeFrom(routes.course.collection),
  removeRecord = require("../../helpers").removeFrom(routes.record.collection),
  removeReport = require("../../helpers").removeFrom(routes.report.collection);

describe("Tier", function () {
  describe("POST " + routes.tier.path, function () {

    it("should list all decendents", function (done) {

      var parentTier = require("../../fixtures/parentTier"),
        childTier = require("../../fixtures/childTier1"),
        user = require("../../fixtures/user"),
        record = require("../../fixtures/record"),
        course = require("../../fixtures/course"),
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
            //--- Actual needed Test off the model
            Tier.descendants(parentTier._id, function (err, results) {
              assert.equal(results[0].title, childTier.title);
              callback(null, results);
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

    it("should add a course to a tier", function (done) {
      //--- Actual needed Test off the model

      var parentTier = require("../../fixtures/parentTier"),
        childTier = require("../../fixtures/childTier1"),
        user = require("../../fixtures/user"),
        record = require("../../fixtures/record"),
        course = require("../../fixtures/course"),
        report = null;

      async.waterfall([
          function (callback) {
            //--- Adds initial tier
            env.intTestSetup(parentTier, childTier, course, user, record, function (err, results) {
              report = results;
              callback(null);
            });
          }
        ],
        function (err, results) {
          //----- Actual testing adding a course
          Tier.addCourse(parentTier._id, course._id, function (err, result) {
            assert.equal(result, 1);

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

    it("should find parent of a tier", function (done) {
      //--- Actual needed Test off the model

      var parentTier = require("../../fixtures/parentTier"),
        childTier = require("../../fixtures/childTier1"),
        user = require("../../fixtures/user"),
        record = require("../../fixtures/record"),
        course = require("../../fixtures/course"),
        report = null;

      async.waterfall([
          function (callback) {
            //--- Adds initial tier
            env.intTestSetup(parentTier, childTier, course, user, record, function (err, results) {
              report = results;
              callback(null);
            });
          }
        ],
        function (err, results) {
          //----- Actual testing adding a course
          Tier.findParent(childTier.parent, function (err, results) {
            assert.equal(results[0].title, parentTier.title);
            removeUser(user);
            removeReport(report);
            removeRecord(record);
            removeCourse(course);
            removeTier(childTier);
            removeTier(parentTier);
            done();
          });
        });
    });

    it("should add a child to parent", function (done) {
      //--- Actual needed Test off the model

      var parentTier = require("../../fixtures/parentTier"),
        childTier = require("../../fixtures/childTier1"),
        user = require("../../fixtures/user"),
        record = require("../../fixtures/record"),
        course = require("../../fixtures/course"),
        report = null;

      async.waterfall([
          function (callback) {
            //--- Adds initial tier
            env.intTestSetup(parentTier, childTier, course, user, record, function (err, results) {
              report = results;
              callback(null);
            });
          }
        ],
        function (err, results) {
          //----- Actual testing adding a course
          Tier.addChildToParent(parentTier._id, childTier._id, function (err, results) {

            assert.equal(results, 1);
            removeUser(user);
            removeReport(report);
            removeRecord(record);
            removeCourse(course);
            removeTier(childTier);
            removeTier(parentTier);
            done();
          });
        });
    });

    it("should list children tiers", function (done) {
      //--- Actual needed Test off the model

      var parentTier = require("../../fixtures/parentTier"),
        childTier = require("../../fixtures/childTier1"),
        user = require("../../fixtures/user"),
        record = require("../../fixtures/record"),
        course = require("../../fixtures/course"),
        report = null;

      async.waterfall([
          function (callback) {
            //--- Adds initial tier
            env.intTestSetup(parentTier, childTier, course, user, record, function (err, results) {
              report = results;
              callback(null);
            });
          }
        ],
        function (err, results) {
          //----- Actual testing adding a course
          Tier.listChildrenTiers(parentTier._id, function (err, results) {

            assert.equal(results[0].title, childTier.title);
            removeUser(user);
            removeRecord(record);
            removeReport(report);
            removeCourse(course);
            removeTier(childTier);
            removeTier(parentTier);
            done();
          });
        });
    });

    it("should add course to all decendents", function (done) {

      var parentTier = require("../../fixtures/parentTier"),
        childTier = require("../../fixtures/childTier1"),
        user = require("../../fixtures/user"),
        record = require("../../fixtures/record"),
        course = require("../../fixtures/course"),
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
            //--- Actual needed Test off the model
            Tier.addCourseAllDescendants(parentTier._id, course._id, function (err, result) {
              assert.equal(result[0], 1);
              callback(err, result);
            });
          }

        ],
        function (err, results) {
          removeUser(user);
          removeRecord(record);
          removeCourse(course);
          removeReport(report);
          removeTier(childTier);
          removeTier(parentTier);
          done();
        });

    });

  });
});
