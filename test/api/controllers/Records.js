var app = require("../../../index"),
  assert = require("assert"),
  async = require("async"),
  request = require("supertest");

var Tier = require("../../../lib/models/Tier");

var route = {
  tier: {
    path: "/tier/",
    collection: "tiers"
  },
  course: {
    path: "/course/",
    collection: "courses"
  },
  user: {
    path: "/user/",
    collection: "users"
  },
  record: {
    path: "/record/",
    collection: "records"
  }
};

describe("Tier", function () {
  describe("POST " + route.path, function () {

    var createAndTestTier = require("../../helpers").createAndTestFrom(route.tier.collection),
      removeTier = require("../../helpers").removeFrom(route.tier.collection),
      createAndTestUser = require("../../helpers").createAndTestFrom(route.user.collection),
      removeUser = require("../../helpers").removeFrom(route.user.collection),
      createAndTestCourse = require("../../helpers").createAndTestFrom(route.course.collection),
      removeCourse = require("../../helpers").removeFrom(route.course.collection),
      createAndTestRecord = require("../../helpers").createAndTestFrom(route.record.collection),
      removeRecord = require("../../helpers").removeFrom(route.record.collection);

    var intTestSetup = function (parentTier, childTier, course, user, record, callback) {

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

                assert.equal(res.body.title, childTier.title);
                childTier._id = res.body._id;
                callback(null);
              });
          },
          function (callback) {
            //--- Create a course
            createAndTestCourse(course, function (result) {
              course = result;
              callback(null, course);
            });
          },
          function (course, callback) {
            Tier.addCourseAllDescendants(parentTier._id, course._id, function (err, result) {
              callback(err);
            });
          },
          function (callback) {

            user._tier = childTier._id;
            createAndTestUser(user, function (result) {
              callback(null, user);
            });
          },
          function (user, callback) {
            record._user = user._id;
            record._course = course._id;
            createAndTestRecord(record, function (result) {
              callback(null, result);
            });
          }

        ],
        function (err, results) {

          callback(err, results);
        });
    };

    it("should list course", function (done) {

      var parentTier = require("../../fixtures/parentTier"),
        childTier = require("../../fixtures/childTier1"),
        user = require("../../fixtures/user"),
        record = require("../../fixtures/record"),
        course = require("../../fixtures/course");

      async.waterfall([
          function (callback) {
            //--- Adds initial tier
            intTestSetup(parentTier, childTier, course, user, record, function (err, results) {
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

                //assert.equal(res.body.title, usaTier.title);
                callback(null);
              });

          }
        ],
        function (err, results) {
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
