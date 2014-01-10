
var app = require("../../index")
  , assert = require("assert")
  , request = require("supertest");

var route = {
  path: "/user/",
  collection: "users"
};

var createAndTest = require("../helpers").createAndTestFrom(route.collection);
var remove = require("../helpers").removeFrom(route.collection);

describe("User", function() { 
  describe("POST " + route.path, function() {

    var test_user = {
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
    }



    it("should list users created courses", function(done) {
      
      request(app)
      .post(route.path + 'list_users_created_courses')
      .send(test_user)
      .expect('Content-Type', /json/)
      .expect(404)
      .end(function(err, res){
        console.log('wat--------', err)
        console.log('wat--------', res.body)
        //assert.equal(res.body.results.title, 'Galaxy');
        done();
      })  
    });



  });
});
