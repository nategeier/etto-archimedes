"use strict";

var app = require("../../index"),
  assert = require("assert"),
  request = require("supertest"),
  routes = require("../routes.json"),
  setup = require("../fixtures/testSetUp");

var removeRecord = require("../helpers").removeFrom(routes.record.collection);

describe("Record", function () {
  describe("POST " + routes.record.path, function () {

    it("should create a course record", function (done) {

      request(app)
        .get("/record/create/" + setup.user._id + "?courseId=" + setup.course._id)
        .expect("Content-Type", /json/)
        .expect(200)
        .end(function (err, res) {
          assert.equal(res.body._user, setup.user._id);
          removeRecord(res.body);
          done();
        });
    });

    it("should get all course records in a tier", function (done) {

      request(app)
        .get("/record/tier/" + setup.parentTier._id)
        .expect("Content-Type", /json/)
        .expect(200)
        .end(function (err, res) {
          console.log("finalist", res.body);
          //assert.equal(res.body._user, setup.user._id);
          //removeRecord(res.body);
          done();
        });
    });

  });
});
