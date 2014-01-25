"use strict"

var app = require("../../index"),
  assert = require("assert"),
  async = require("async"),
  request = require("supertest"),
  tiers = require("../fixtures/tiers"),
  order = require("../fixtures/order");

var route = {
  path: "/tier/",
  collection: "tiers"
};

describe("Store", function () {
  describe("POST " + route.path, function () {
    /*
    var createAndTest = require("../helpers").createAndTestFrom(route.collection);
    var removeFrom = require("../helpers").removeFrom(route.collection);

    var addTiers = function (tiers, callback) {
      async.map(tiers, function (tier, callback) {
        createAndTest(tier, function (tier) {
          callback(null, tier);
        });

      }, function (err, addTiers) {
        callback(err, addTiers);
        //-----
      });
    };

    var removeTiers = function (tiers, callback) {

      async.map(tiers, function (tier, ready) {
        removeFrom(tier);
        ready(null, null);

      }, function (err, result) {
        callback(err, result);
      });
    };

    it("should enter documents tiers", function (done) {

      async.waterfall([
          function (callback) {
            addTiers(tiers, function (err, results) {
              callback(err, results);
            });
          },
          function (addedTiers, callback) {


            request(app)
              .post("/store/purchase")
              .send(order)
              .expect("Content-Type", /json/)
              .expect(200)
              .end(function (err, res) {
                assert.equal(res.body.paid, true);
                callback(null, addedTiers);
              });
          },

          function (addedTiers, callback) {
            removeTiers(addedTiers, function (err, results) {
              callback(err, results);
            });
          }
        ],
        function (err, result) {
          done();
        });
    });
    */
    /*
    it("should find card from Stripe memeber", function (done) {
      request(app)
        .post("/store/find")
        .send(docs.order.user._id)
        .expect("Content-Type", /json/)
        .expect(200)
        .end(function (err, res) {
          console.log(res.body)
          assert.equal(err, null);
          done();
        });
    });
*/
  });
});
