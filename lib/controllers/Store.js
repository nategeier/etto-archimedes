"use strict";

var async = require("async"),
  config = require("../server/config"),
  stripe = require("stripe")(config.get("stripe:secret")),
  Tier = require("../models/Tier");

var find = function (req, res) {

  var id = req.body._id;

  stripe.customers.retrieve(id, function (err, customer) {

    if (customer && customer.deleted) {
      customer = null;
      return res.json(200, customer);
    } else {
      return res.json(200, null);
    }

  });
};

var purchase = function (req, res) {
  var order = req.body;
  console.log(order);

  var desc = "Purchase " + order.course.courseTitle;
  var price = Number(order.course.price) * 100;

  async.waterfall([
      //--- Look for user exists
      function (callback) {

        async.map(order.tiers, function (tier, callback) {
            //--------- Tier closed, but has childen
            if (tier.minimized === true && tier.hasChildren === true && tier.hasAddedChildren === false) {

              async.parallel([

                  function (callback) {
                    Tier.addCourse(tier._id, order.course._id, function (err, results) {
                      callback(err, results);
                    });
                  },
                  function (callback) {
                    Tier.descendants(tier._id, function (err, descendants) {

                      async.map(descendants, function (child, callback) {
                          Tier.addCourse(child._id, order.course._id, function (err, results) {
                            callback(err, results);
                          });
                        },
                        function (err, results) {
                          callback(err, results);
                        });
                    });
                  }
                ],
                function (err, results) {
                  callback(err, results);
                });

              //--------- Tier closed, but no childen
            } else if ((tier.minimized === true && tier.hasChildren === false) || (tier.minimized === true && tier.hasAddedChildren === true) || (tier.minimized === false)) {
              Tier.addCourse(tier._id, order.course._id, function (err, results) {
                callback(err, results);
              });
            }
          },
          function (err, results) {
            callback(err);
          });
      },
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
      function (done) { //--- Pay for module
        stripe.charges.create({
          amount: price,
          currency: "usd",
          customer: order.user._id,
          description: desc
        }, function (err, results) {
          done(err, results);
        });
      }
    ],

    function (err, result) {
      return res.json(200, result);
    });
};

/**
### Exports
 -----
 *
 */

module.exports = {
  purchase: purchase,
  find: find

};
