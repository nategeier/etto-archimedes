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

var purchase = function (req, res) {
  var order = req.body;

  var desc = "None";

  var courseId = null;

  if (order.courseId) {
    desc = "Purchased Course " + order.courseId;
    courseId = order.courseId;
  } else {
    desc = "Added Credits, userID " + order.user._id;
  }

  var price = Number(order.addedCredits) * 100;

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
            email: order.user.email[0],
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
            "credits": order.addedCredits
          },
          "$addToSet": {
            "purchased": {
              "purchaser": order.user._id,
              "credits": order.addedCredits,
              "amount": order.addedCredits,
              "_course": courseId

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
        //--- Just adding credits, no course was purchased
        if (!courseId) {
          callback(null, "Credits have been added");
        } else {
          //----- Purchased a couses, add course to correct tiers
          async.map(order.tiers, function (tier, callback) {
              //--------- Tier closed, but is on and has childen, update tier and all it's decendence to have course
              if (tier.minimized === true && tier.hasChildren === true && tier.hasAddedChildren === false) {

                //--- Create top tier report
                Tier.addCourseAllDescendants(tier._id, courseId, function (err, results) {
                  //--- Create all decendents tiers report
                  callback(err, results);
                });

                //--------- Tier closed, but no childen or is off
              } else if ((tier.minimized === true && tier.hasChildren === false) || (tier.minimized === true && tier.hasAddedChildren === true) || (tier.minimized === false)) {

                Tier.addCourse(tier._id, courseId, function (err, results) {
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
