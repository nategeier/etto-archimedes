"use strict";

var app = require("../../index"),
  assert = require("assert"),
  request = require("supertest"),
  routes = require("../routes.json"),
  setup = require("../fixtures/testSetUp");

var removeTier = require("../helpers").removeFrom(routes.tier.collection);

describe("Tier", function () {
  describe("POST " + routes.tier.path, function () {

    it("should create a company", function (done) {

      var newCompany = {
        title: "Bobs Burgers"
      };

      request(app)
        .post("/tier/createCompany")
        .send(newCompany)
        .expect("Content-Type", /json/)
        .expect(200)
        .end(function (err, res) {
          assert.equal(res.body.title, newCompany.title);
          removeTier(res.body);
          done();
        });

    });

    it("should add a tier", function (done) {

      var newTier = {
        title: "USA"
      };

      newTier.parent = setup.childTier._id;

      request(app)
        .post("/tier/add")
        .send(newTier)
        .expect("Content-Type", /json/)
        .expect(200)
        .end(function (err, res) {
          assert.equal(res.body.title, newTier.title);
          removeTier(res.body);
          done(null);
        });
    });

    it("should list all children and counts users and all tiers", function (done) {

      request(app)
        .post("/tier/list_children_and_count_users")
        .send(setup.parentTier)
        .expect("Content-Type", /json/)
        .expect(200)
        .end(function (err, res) {
          assert.equal(res.body[0].totUsers, 1);
          done(null);
        });

    });

    it("should remove tier and all its children", function (done) {

      request(app)
        .post("/tier/remove")
        .send(setup.parentTier)
        .expect("Content-Type", /json/)
        .expect(200)
        .end(function (err, res) {
          assert.equal(res.body, 200);
          done();
        });

    });

    it("should list all courses in tier", function (done) {

      request(app)
        .post("/course/listTiersCourses")
        .send(setup.childTier)
        .expect("Content-Type", /json/)
        .expect(200)
        .end(function (err, res) {
          assert.equal(res.body._courses[0].title, setup.course.title);
          done();
        });

    });

  });
});