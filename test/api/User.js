"use strict";

var app = require("../../index"),
  assert = require("assert"),
  request = require("supertest"),
  routes = require("../routes.json"),
  setup = require("../fixtures/testSetUp");

var Jack = require("../fixtures/data/jack");

var removeUser = require("../helpers").removeFrom(routes.user.collection);

describe("Tier", function () {
  describe("POST " + routes.user.path, function () {

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

    it("should save a new user", function (done) {

      request(app)
        .post("/user/saveNewUser")
        .send(Jack)
        .expect("Content-Type", /json/)
        .expect(200)
        .end(function (err, res) {

          assert.equal(res.body.name, Jack.name);
          removeUser(res.body);
          done();
        });
    });

    /*
    it("should list all details of a user", function (done) {
      request(app)
        .get("/user/fullDetails/" + setup.user._id)
        .expect("Content-Type", /json/)
        .expect(200)
        .end(function (err, res) {
          assert.equal(res.body.name, setup.user.name);
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
          console.log(res.body, "-----------------")
          assert.equal(res.body.name, setup.user.name);
          done();
        });
    });
*/
    /*
    it("should invite a new user", function (done) {
      this.timeout(9000);
      Jack._tier = setup.childTier._id;

      request(app)
        .post("/user/inviteUser")
        .send(Jack)
        .expect("Content-Type", /json/)
        .expect(200)
        .end(function (err, res) {
          assert.equal(res.body.email[0], Jack.email);
          removeUser(res.body);
          done();
        });
    });
   

    it("should upate a user", function (done) {

      var newName = "bill"
      setup.user.name = newName;

      request(app)
        .post("/user/update")
        .send(setup.user)
        .expect("Content-Type", /json/)
        .expect(200)
        .end(function (err, res) {
          console.log("wats-----------?", res.body)
          assert.equal(res.body.name, newName);
          removeUser(res.body);
          done();
        });
    });
    */

    /*
    it("should error out email already exists", function (done) {

      var newJack = new Jack();
      newJack.email = setup.user.email;

      request(app)
        .post("/user/saveNewUser")
        .send(newJack)
        .expect("Content-Type", /json/)
        .expect(200)
        .end(function (err, res) {
          console.log("wats-----------?")
          //assert.notEqual(res.body.err, null);
          //removeUser(res.body);
          done();
        });
    });
    */

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
