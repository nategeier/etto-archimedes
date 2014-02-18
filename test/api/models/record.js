var assert = require("assert"),
  async = require("async"),
  routes = require("../../routes.json"),
  setup = require("../../fixtures/testSetUp");

var Record = require("../../../lib/models/Record"),
  Tier = require("../../../lib/models/Tier"),
  User = require("../../../lib/models/User");

describe("User", function () {
  describe("POST " + routes.record.path, function () {

    it("should get all lower level course records from tier", function (done) {

      async.waterfall([
          function (callback) {
            Tier.descendants(setup.parentTier._id, function (err, tiers) {
              callback(err, tiers);
            });
          },
          function (tiers, callback) {
            User.getLowerUsers(tiers, function (err, users) {
              callback(err, users);
            });
          }
        ],
        function (err, users) {

          Record.getAllUsersCourseRecords(users, setup.course._id, function (err, results) {
            assert.equal(String(results[0]._course), String(setup.course._id));
            done();
          });
        });
    });

  });
});
