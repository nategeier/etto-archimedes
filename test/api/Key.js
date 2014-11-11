"use strict";

var app = require("../../index"),
  assert = require("assert"),
  request = require("supertest"),
  routes = require("../routes.json"),
  setup = require("../fixtures/testSetUp");


var removeKey = require("../helpers").removeFrom(routes.key.collection);
var agent = request.agent(app);

describe("Key", function () {
  describe("POST " + routes.key.path, function () {

    it("should create new keys", function (done) {

      var coursettoBambooKeys = {
        _company: setup.parentTier._id,
        bamboo: {
          apikey: '21f310528e4e9800ad55e79314abcf1f00220849',
          subdomain: 'coursetto'
        }
      }

      setup.agent
        .post("/key/saveBambooKey")
        .send(coursettoBambooKeys)
        .expect("Content-Type", /json/)
        .expect(200)
        .end(function (err, res) {
          assert.equal(res.body._company, setup.parentTier._id);
          removeKey(res.body);
          done();
        });
    });

  });
});
