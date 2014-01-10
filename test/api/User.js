"use strict";

var app = require("../../index"),
  assert = require("assert"),
  request = require("supertest");

var route = {
  path: "/user/",
  collection: "users"
};

var createAndTest = require("../helpers").createAndTestFrom(route.collection);
var remove = require("../helpers").removeFrom(route.collection);

describe("User", function() { 
  describe("POST " + route.path, function() {

    var testUser = {
      "_id": "52b0d1a53a06baa704000054",
      "name": "hank",
      "email": "hanwk@interactivebalance.com",
      "_tier": "52b0d1a53a06baa704000054",
      "auth": 2,
      "enabled": true,
      "meta": {
        "votes": 2,
        "favs":  1
      }
    };


    it("should add user", function(done) {
      
      request(app)
      .post(route.path + "invite_user")
      .send(testUser)
      .expect("Content-Type", /json/)
      .expect(200)
      .end(function(err, res){
        assert.equal(res.body.name, "hank");
        done();
      });
    });



    it("should list users created courses", function(done) {
      
      request(app)
      .post(route.path + "list_users_created_courses")
      .send(testUser)
      .expect("Content-Type", /json/)
      .expect(200)
      .end(function(err, res){
        assert.equal(err, null);
        done();
      });
    });


    it("should list all users in a tier", function(done) {
      
      request(app)
      .post(route.path + "listUsersInTier/52b0d1a53a06baa704000054")
      .send(testUser)
      .expect("Content-Type", /json/)
      .expect(200)
      .end(function(err, res){

        assert.equal(res.body[0].name, "hank");
        done();
      });
    });


    it("should remove user", function(done) {
      request(app)
      .post(route.path + "destroy")
      .send(testUser)
      .expect("Content-Type", /json/)
      .expect(200, done);
    });
  });
});
