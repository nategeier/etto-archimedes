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
  }
};

describe("Tier", function () {
  describe("POST " + route.path, function () {

    var createAndTestTier = require("../../helpers").createAndTestFrom(route.tier.collection),
      removeTier = require("../../helpers").removeFrom(route.tier.collection),
      createAndTestCourse = require("../../helpers").createAndTestFrom(route.course.collection),
      removeCourse = require("../../helpers").removeFrom(route.course.collection);

    var intTestSetup = function (parentTier, childTier, course, callback) {

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
              callback(null, result);
            });
          }

        ],
        function (err, results) {

          callback(err, results);
        });
    };

    it("should list all decendents", function (done) {

      var parentTier = require("../../fixtures/parentTier"),
        childTier = require("../../fixtures/childTier1"),
        course = require("../../fixtures/course");

      async.waterfall([
          function (callback) {
            //--- Adds initial tier
            intTestSetup(parentTier, childTier, course, function (err, results) {
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
        course = require("../../fixtures/course");

      async.waterfall([
          function (callback) {
            //--- Adds initial tier
            intTestSetup(parentTier, childTier, course, function (err, results) {
              callback(null);
            });
          }
        ],
        function (err, results) {
          //----- Actual testing adding a course
          Tier.addCourse(parentTier._id, course._id, function (err, result) {
            assert.equal(result, 1);
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
        course = require("../../fixtures/course");

      async.waterfall([
          function (callback) {
            //--- Adds initial tier
            intTestSetup(parentTier, childTier, course, function (err, results) {
              callback(null);
            });
          }
        ],
        function (err, results) {
          //----- Actual testing adding a course
          Tier.findParent(childTier.parent, function (err, results) {
            assert.equal(results[0].title, parentTier.title);
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
        course = require("../../fixtures/course");

      async.waterfall([
          function (callback) {
            //--- Adds initial tier
            intTestSetup(parentTier, childTier, course, function (err, results) {
              callback(null);
            });
          }
        ],
        function (err, results) {
          //----- Actual testing adding a course
          Tier.addChildToParent(parentTier._id, childTier._id, function (err, results) {

            assert.equal(results, 1);
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
        course = require("../../fixtures/course");

      async.waterfall([
          function (callback) {
            //--- Adds initial tier
            intTestSetup(parentTier, childTier, course, function (err, results) {
              callback(null);
            });
          }
        ],
        function (err, results) {
          //----- Actual testing adding a course
          Tier.listChildrenTiers(parentTier._id, function (err, results) {
            assert.equal(results[0].title, childTier.title);
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
        course = require("../../fixtures/course");

      async.waterfall([
          function (callback) {
            //--- Adds initial tier
            intTestSetup(parentTier, childTier, course, function (err, results) {
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
          removeCourse(course);
          removeTier(childTier);
          removeTier(parentTier);
          done();
        });

    });

  });
});
