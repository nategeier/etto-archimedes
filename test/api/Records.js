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
  describe("POST " + routes.record.path, function () {

    it("should list course", function (done) {

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
              .post("/record/countCoursesRecordsInTier")
              .send(parentTier)
              .expect("Content-Type", /json/)
              .expect(200)
              .end(function (err, res) {
                console.log("whats----------------------", res.body);
                //assert.equal(res.body.title, parentTier.title);
                callback(null);
              });

          }
        ],
        function (err, results) {

          removeReport(report);
          removeRecord(record);
          removeUser(user);
          removeCourse(course);
          removeTier(childTier);
          removeTier(parentTier);
          done();
        });

    });

    it("should create a course record", function (done) {

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
              .get("/record/create/" + user._id + "?courseId=" + course._id)
              .send(parentTier)
              .expect("Content-Type", /json/)
              .expect(200)
              .end(function (err, res) {
                assert.equal(res.body._user, user._id);
                callback(null, res.body);
              });

          }
        ],
        function (err, results) {
          //--- Remove new created record
          removeRecord(results);

          //--- Remove all envirnment

          removeReport(report);
          removeRecord(record);
          removeUser(user);
          removeCourse(course);
          removeTier(childTier);
          removeTier(parentTier);
          done();
        });

    });
  });
});
