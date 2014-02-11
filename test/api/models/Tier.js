var assert = require("assert"),
  routes = require("../../routes.json"),
  async = require("async"),
  setup = require("../../fixtures/testSetUp");

var Tier = require("../../../lib/models/Tier"),
  User = require("../../../lib/models/User");

describe("Tier", function () {
  describe("POST " + routes.tier.path, function () {

    it("should list all decendents", function (done) {
      Tier.descendants(setup.parentTier._id, function (err, results) {
        assert.equal(results[0].title, setup.childTier.title);
        done();
      });
    });

    it("should add a course to a tier", function (done) {
      Tier.addCourse(setup.parentTier._id, setup.course._id, function (err, result) {
        assert.equal(result, 1);
        done();
      });
    });

    it("should find parent of a tier", function (done) {

      Tier.findParent(setup.childTier.parent, function (err, results) {
        assert.equal(results.title, setup.parentTier.title);
        done();
      });
    });

    it("should add a child to parent", function (done) {

      Tier.addChildToParent(setup.parentTier._id, setup.childTier._id, function (err, results) {

        assert.equal(results, 1);
        done();
      });
    });

    it("should list children tiers", function (done) {

      Tier.listChildrenTiers(setup.parentTier._id, function (err, results) {
        assert.equal(results[0].title, setup.childTier.title);
        done();
      });
    });

    it("should add course to all decendents", function (done) {

      Tier.addCourseAllDescendants(setup.parentTier._id, setup.course._id, function (err, result) {
        assert.equal(result[0], 1);
        done();
      });
    });

    it("should list all tiers with a course", function (done) {

      async.waterfall([
          function (callback) {
            Tier.descendants(setup.parentTier._id, function (err, tiers) {
              callback(err, tiers);
            });
          }
        ],
        function (err, tiers) {

          Tier.listAllTiersWithCourse(tiers, setup.course._id, function (err, results) {
            assert.equal(results[0].title, setup.childTier.title);
            done();
          });
        });

    });

    it("should get all users within tiers array", function (done) {

      async.waterfall([

          function (callback) {
            Tier.descendants(setup.parentTier._id, function (err, tiers) {
              callback(err, tiers);
            });
          }

        ],
        function (err, tiers) {

          User.getUsersInTiers(tiers, function (err, results) {
            //assert.equal(results[0].title, setup.childTier.title);
            done();
          });
        });

    });
  });
});
