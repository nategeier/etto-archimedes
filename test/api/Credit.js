"use strict";

var app = require("../../index"),
  assert = require("assert"),
  request = require("supertest"),
  routes = require("../routes.json"),
  setup = require("../fixtures/testSetUp");

describe("Record", function () {
  describe("POST " + routes.record.path, function () {

    it("should git all record report for a tier", function (done) {

      request(app)
        .get("/credit/companyCreditsUsed/" + setup.parentTier._id)
        .expect("Content-Type", /json/)
        .expect(200)
        .end(function (err, res) {
          assert.equal(res.body.overallUsed, 0);
          done();
        });
    });

    it("should git all record report for a tier", function (done) {

      request(app)
        .get("/credit/companyPurchases/" + setup.parentTier._id)
        .expect("Content-Type", /json/)
        .expect(200)
        .end(function (err, res) {
          done();
        });
    });

    it("should git all record report for a tier", function (done) {

      request(app)
        .get("/credit/companyRecieved/" + setup.parentTier._id)
        .expect("Content-Type", /json/)
        .expect(200)
        .end(function (err, res) {
          done();
        });
    });
  });
});
