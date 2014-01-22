/*"use strict"

var app = require("../../index"),
  assert = require("assert"),
  request = require("supertest");

var route = {
  path: "/store/"
};

describe("Store", function () {
  describe("POST " + route.path, function () {

    var order = {
      course: {
        price: 5
      },
      user: {
        email: "nate@ib.com",
        _id: "123"
      },
      card: {
        number: "4242424242424242",
        exp_month: "10",
        exp_year: "2015",
        cvc: "333"
      }
    };

    var orderInvalide = {
      course: {
        price: 5
      },
      user: {
        email: "noemail@ib.com",
        _id: "456"
      },
      card: {
        number: "4242424242424242",
        exp_month: "10",
        exp_year: "2015",
        cvc: "333"
      }
    };

    it("should add and add payment a card memeber to Stripe", function (done) {
      request(app)
        .post("/store/purchase")
        .send(order)
        .expect("Content-Type", /json/)
        .expect(200)
        .end(function (err, res) {
          assert.equal(err, null);
          done();
        });
    });

    it("should find card from Stripe memeber", function (done) {
      request(app)
        .post("/store/find")
        .send(order.user._id)
        .expect("Content-Type", /json/)
        .expect(200)
        .end(function (err, res) {
          assert.equal(err, null);
          done();
        });
    });

    it("should not find card from Stripe memeber, non exist", function (done) {
      request(app)
        .post("/store/find")
        .send(orderInvalide.user._id)
        .expect("Content-Type", /json/)
        .expect(200)
        .end(function (err, res) {
          assert.equal(err, null);
          done();
        });
    });

  });
});

*/
