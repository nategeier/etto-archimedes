var app = require("../../index"),
  assert = require("assert"),
  async = require("async"),
  request = require("supertest"),
  routes = require("../routes.json"),
  env = require("../fixtures/testSetUp");

var removeTier = require("../helpers").removeFrom(routes.tier.collection),
  removeUser = require("../helpers").removeFrom(routes.user.collection),
  removeCourse = require("../helpers").removeFrom(routes.course.collection),
  removeRecord = require("../helpers").removeFrom(routes.record.collection),
  removeReport = require("../helpers").removeFrom(routes.report.collection);

describe("Tier", function () {
  describe("POST " + routes.record.path, function () {
    /*
    it("should puchase a course", function (done) {

      var parentTier = require("../fixtures/parentTier"),
        childTier = require("../fixtures/childTier1"),
        user = require("../fixtures/user"),
        record = require("../fixtures/record"),
        course = require("../fixtures/course"),
        report = null;

      async.waterfall([
          function (callback) {
            //--- Adds initial tier
            env.intTestSetup(parentTier, childTier, course, user, record, function (err, results) {
              report = results;
              callback(null);
            });
          },
          function (callback) {

            var order = {
              "course": {
                "price": "5.00",
                "_id": course._id
              },
              "user": {
                "__v": 0,
                "_id": user._id,
                "_tier": {
                  "_id": parentTier._id
                },
                "email": "nate@interactivebalance.com",
                "enabled": true,
                "name": "Nate Geier",
                "provider": "github",
                "meta": {
                  "votes": 1,
                  "favs": 1
                },
                "_needToTakeCourses": [],
                "_createdCourses": [],
                "created": "2014-01-23T19:49:05.578Z"
              },
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
                "_id": parentTier._id
              }, {
                "hasChildren": false,
                "hasAddedChildren": false,
                "minimized": true,
                "_id": childTier._id
              }]
            };

            request(app)
              .post("/store/purchase")
              .send(order)
              .expect("Content-Type", /json/)
              .expect(200)
              .end(function (err, res) {

                //assert.equal(res.body.title, usaTier.title);
                callback(null);
              });

          }
        ],
        function (err, results) {

          removeReport(report);
          removeRecord(record);
          removeUser(user);
          removeCourse(course);
          removeTier(childTier);
          removeTier(parentTier);
          done();
        });

    });
    */
  });
});
