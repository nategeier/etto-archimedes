"use strict";

var app = require("../../index"),
  assert = require("assert"),
  request = require("supertest"),
  routes = require("../routes.json"),
  setup = require("../fixtures/testSetUp");

var async = require("async");

var removeRecord = require("../helpers").removeFrom(routes.record.collection);
var agent = request.agent(app);

describe("Record", function () {
  describe("POST " + routes.record.path, function () {

    //----- Need to test another by creating a course and outside tier to test docing points

    it("should create, update and get a users overall records", function (done) {

      async.waterfall([

          function (callback) {
            setup.agent
              .get("/record/create/" + setup.user._id + "?courseId=" + setup.course._id)
              .expect("Content-Type", /json/)
              .expect(200)
              .end(function (err, res) {
                assert.equal(res.body._user, setup.user._id);
                //removeRecord(res.body);
                callback(err, res.body);
              });
          },
          function (record, callback) {
            setup.agent
              .get("/record/updateBookmark/" + record._id + "?bookmark=10&totalBlocks=10")
              .expect("Content-Type", /json/)
              .expect(200)
              .end(function (err, res) {
                assert.equal(res.body._user, setup.user._id);
                callback(null, record);
              });
          },
          function (record, callback) {
            setup.agent
              .get("/record/userOverallProgress/" + setup.user._id + "?tierId=" + setup.childTier._id)
              .expect("Content-Type", /json/)
              .expect(200)
              .end(function (err, res) {
                assert.equal(res.body.overallPercent, 100);
                callback(null, record);
              });
          }

        ],
        function (err, results) {
          removeRecord(results);
          done();
        });

    });

    it("should git all record report for a tier", function (done) {

      setup.agent
        .get("/record/tierReport/" + setup.parentTier._id)
        .expect("Content-Type", /json/)
        .expect(200)
        .end(function (err, res) {
          assert.equal(res.body.totalUsers, 1);
          done();
        });
    });
  });
});
