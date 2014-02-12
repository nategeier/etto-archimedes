"use strict";

var async = require("async"),
  config = require("../server/config"),
  stripe = require("stripe")(config.get("stripe:secret")),
  Tier = require("../models/Tier"),
  Credit = require("../models/Credit");

var findCard = function (req, res) {

  var id = req.params.id || req.query.id;

  stripe.customers.retrieve(id, function (err, customer) {

    if (customer && !customer.deleted) {
      return res.json(200, customer);
    } else {
      return res.json(200, null);
    }
  });
};

var findCredit = function (req, res) {

  var id = req.params.id || req.query.id;

  Credit.findCredit(id, function (err, credit) {
    // Otherwise return the array of found objects
    return res.json(200, credit);

  });
};
/*
var createReport = function (tierId, courseID, done) {
  User.find({
    _tier: tierId
  }, function (err, results) {

    var ids = [];

    if (results && results[0]) {
      async.map(results, function (id) {
        ids.push(id._id);
      });
    }

    Report.ifExists(tierId, courseID, function (err, course) {

      if (course) {
        done(err, null);
      } else {
        //---------
        var newReport = new Report({
          _tier: tierId,
          _course: courseID,
          _notCompleted: ids
        });
        newReport.save(function (err, results) {
          done(err, results);
        });
      }
    });

  });
};
*/
var purchase = function (req, res) {
  var order = req.body;

  var desc = "Purchase " + order.course.title;
  var price = Number(order.course.price) * 100;

  async.waterfall([
      //--- Look for user exists

      function (callback) {

        stripe.customers.retrieve(order.user._id, function (err, customer) {
          if (customer) {
            callback(err, customer);
          } else {
            callback(null, null);
          }
        });
      }, //--- Check user exists

      function (customer, callback) {
        if (customer) { //--- User exists
          callback(null);
        } else { //--- Add user
          stripe.customers.create({
            description: "Customer for Coursetto",
            email: order.user.email,
            id: order.user._id,
            card: order.card
          }, function (err, customer) {
            callback(err);
          });
        }
      },

      function (callback) { //--- Pay for module

        stripe.charges.create({
          amount: price,
          currency: "usd",
          customer: order.user._id,
          description: desc
        }, function (err, results) {
          callback(err);
        });
      }, //------ Set credit invoice record for company
      function (callback) {

        var updateQuery = {

          "$set": {
            "_company": order.user._tier._company || order.user._company
          },
          "$inc": {
            "credits": order.course.price
          },
          "$addToSet": {
            "purchased": {
              "purchaser": order.user._id,
              "credits": order.credits,
              "amount": order.course.price,
              "_course": order.course._id

            }
          }
        };
        Credit.update({
          "_company": order.user._tier._company || order.user._company
        }, updateQuery, {
          upsert: true
        }, function (err, numberAffected, rawResponse) {

          callback(err);
        });
      }, //---- Deligate course to correct tiers
      function (callback) {
        async.map(order.tiers, function (tier, callback) {
            //--------- Tier closed, but is on and has childen, update tier and all it's decendence to have course
            if (tier.minimized === true && tier.hasChildren === true && tier.hasAddedChildren === false) {

              //--- Create top tier report
              Tier.addCourseAllDescendants(tier._id, order.course._id, function (err, results) {
                //--- Create all decendents tiers report
                callback(err, results);
              });

              //--------- Tier closed, but no childen or is off
            } else if ((tier.minimized === true && tier.hasChildren === false) || (tier.minimized === true && tier.hasAddedChildren === true) || (tier.minimized === false)) {

              Tier.addCourse(tier._id, order.course._id, function (err, results) {
                callback(err, results);
              });
            } else {
              callback(null, null);
            }
          },

          function (err, results) {

            callback(err, results);
          });
      }
    ],

    function (err, result) {
      if (err) {
        return res.json(500, err);
      }
      return res.json(200, result);
    });
};

/**
### Exports
 -----
 *
 */

module.exports = {
  findCredit: findCredit,
  purchase: purchase,
  findCard: findCard
};
