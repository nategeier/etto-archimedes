/*var assert = require("assert"),
  async = require("async"),
  routes = require("../../routes.json"),
  setup = require("../../fixtures/testSetUp");

var Tier = require("../../../lib/models/Tier"),
  User = require("../../../lib/models/User");

describe("User", function () {
  describe("POST " + routes.user.path, function () {

    it("should get all lower level employees from tier", function (done) {

      async.waterfall([

          function (callback) {
            Tier.descendants(setup.parentTier._id, function (err, tiers) {
              callback(err, tiers);
            });
          }
        ],
        function (err, tiers) {

          User.getLowerUsers(tiers, function (err, results) {
            assert.equal(results[0].name, setup.user.name);
            done();
          });
        });
    });
  });
});
*.
*/
