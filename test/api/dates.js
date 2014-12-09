"use strict";

var Dates = require("../../lib/services/dates"),
  assert = require("assert");


describe("Key", function () {
  describe("Dates ", function () {

    it("should get the fortnight from today", function (done) {

      var currentTime = new Date();
      var fortnightAway = currentTime.setDate(currentTime.getDate()+14);

      assert.equal(Dates.fortnightAway(), fortnightAway);
      done();
    });

  });
});
