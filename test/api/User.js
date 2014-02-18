"use strict";

var app = require("../../index"),
  assert = require("assert"),
  request = require("supertest"),
  routes = require("../routes.json"),
  setup = require("../fixtures/testSetUp");

var removeUser = require("../helpers").removeFrom(routes.user.collection);

describe("Tier", function () {
  describe("POST " + routes.tier.path, function () {

    it("should list users in a tier", function (done) {

      request(app)
        .get("/user/listUsersInTier/" + setup.childTier._id)
        .expect("Content-Type", /json/)
        .expect(200)
        .end(function (err, res) {
          assert.equal(res.body[0].name, setup.user.name);
          done();
        });
    });

    it("should update users info", function (done) {

      setup.user.username = "newname";

      request(app)
        .post("/user/update_users_tier")
        .send(setup.user)
        .expect("Content-Type", /json/)
        .expect(200)
        .end(function (err, res) {
          assert.equal(res.body.name, setup.user.name);
          done();
        });
    });
    /*
    it("should invite a user info", function (done) {

      var newUser = {
        __v: 0,
        email: ["nate@interactivebalance.com"],
        _tier: setup.childTier._id,
        auth: {
          canInvite: true,
          canGetCourses: false,
          canCreateCourses: false,
          canPurchase: false
        },
        meta: {
          votes: 1,
          favs: 1
        }
      };

      request(app)
        .post("/user/inviteUser")
        .send(newUser)
        .expect("Content-Type", /json/)
        .expect(200)
        .end(function (err, res) {
          assert.equal(res.body.name, newUser.name);
          removeUser(res.body);
          done();
        });
    });
    */
  });
});
