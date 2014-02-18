var app = require("../../index"),
  assert = require("assert"),
  async = require("async"),
  request = require("supertest"),
  routes = require("../routes.json"),
  setup = require("../fixtures/testSetUp");
/*
describe("Tier", function () {
  describe("POST " + routes.record.path, function () {

    it("should purchase a course", function (done) {

      var order = {
        "course": {
          "price": "5.00",
          "_id": setup.course._id
        },
        "user": setup.user,
        "card": {
          "number": "4242424242424242",
          "exp_month": "10",
          "exp_year": "2014",
          "cvc": "333"
        },
        "tiers": [{
          "hasChildren": true,
          "hasAddedChildren": true,
          "minimized": true,
          "_id": setup.parentTier._id
        }, {
          "hasChildren": false,
          "hasAddedChildren": false,
          "minimized": true,
          "_id": setup.childTier._id
        }]
      };

      request(app)
        .post("/store/purchase")
        .send(order)
        .expect("Content-Type", /json/)
        .expect(200)
        .end(function (err, res) {
          console.log("-----------anything", res.body);
          assert.equal(res.body[0], 1);
          done();
        });

    });
  });
});
*/
