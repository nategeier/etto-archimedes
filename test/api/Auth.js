"use strict";

var app = require("../../index"),
  assert = require("assert"),
  request = require("supertest"),
  routes = require("../routes.json"),
  setup = require("../fixtures/testSetUp");

var agent = request.agent(app);

describe("Auth", function () {
  describe("POST auth", function () {

    it("should list current session", function (done) {

      setup.agent
        .get("/auth/getSession")
        .set("Accept", "application/json")
        .expect("Content-Type", /json/)
        .expect(200)
        .end(function (err, res) {
          assert.equal(res.body.name, setup.user.name);
          done();
        });
    });

  });
});
