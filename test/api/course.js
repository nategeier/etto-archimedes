"use strict";

var app = require("../../index"),
  assert = require("assert"),
  request = require("supertest"),
  routes = require("../routes.json"),
  setup = require("../fixtures/testSetUp");

describe("Course", function () {
  describe("GET course", function () {

    it("should list Company Courses", function (done) {
      setup.agent
        .get("/course/listCompanyCourses/" + setup.parentTier._id)
        .set("Accept", "application/json")
        .expect("Content-Type", /json/)
        .expect(200)
        .end(function (err, res) {
          assert.equal(res.body[0], null);
          done();
        });
    });
  });
});
