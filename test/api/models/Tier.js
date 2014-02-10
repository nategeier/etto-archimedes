var assert = require("assert"),
  routes = require("../../routes.json"),
  setup = require("../../fixtures/testSetUp");

var Tier = require("../../../lib/models/Tier");

describe("Tier", function () {
  describe("POST " + routes.tier.path, function () {

    it("should list all decendents", function (done) {
      Tier.descendants(setup.parentTier._id, function (err, results) {
        assert.equal(results[0].title, setup.childTier.title);
        done();
      });
    });

    it("should add a course to a tier", function (done) {
      //--- Actual needed Test off the model
      Tier.addCourse(setup.parentTier._id, setup.course._id, function (err, result) {
        assert.equal(result, 1);
        done();
      });
    });

    it("should find parent of a tier", function (done) {
      //--- Actual needed Test off the model

      Tier.findParent(setup.childTier.parent, function (err, results) {
        assert.equal(results.title, setup.parentTier.title);
        done();
      });
    });

    it("should add a child to parent", function (done) {
      //--- Actual needed Test off the model

      Tier.addChildToParent(setup.parentTier._id, setup.childTier._id, function (err, results) {

        assert.equal(results, 1);
        done();
      });
    });

    it("should list children tiers", function (done) {
      //--- Actual needed Test off the model

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
  });
});