"use strict";

var async = require("async"),
  config = require("../server/config"),
  stripe = require("stripe")(config.get("stripe:secret")),
  Tier = require("../models/Tier"),
  Subscription = require("../models/Subscription"),
  Course = require("../models/Course"),
  Purchase = require("../models/credits/Purchase");

/**
 * listStoreCourses
 *
 */
var storeCourses = function (req, res) {

  Course.storeCourses(function (err, courses) {
    if (err) {
      return res.json(500, "Error");
    }
    if (courses === null) {
      courses = [];
    }
    return res.json(200, courses);
  });
};

/**
 * updateCredit
 *
 */

var checkCanAddCourse = function (req, res) {

  var companyId = req.params.companyId || req.query.companyId;

  var subscribed = {
    isGood: false
  };

  async.waterfall([

      //--- Look for stripe customer exists
      function (callback) {
        Course.getCeatedCourses(companyId, function (err, results) {
          //---Users has not created a course yet, let them do one free
          if (results.length === 0) {
            subscribed.isGood = true;
            callback(subscribed);
          } else {
            callback(err, results.length);
          }
        });
      },
      function (numCourses, callback) {
        Tier.findTier(companyId, function (err, results) {
          callback(err, numCourses, results);
        });
      },
      function (numCourses, company, callback) {
        Subscription.findSubscription(company._subscription, function (err, results) {

          if (results && numCourses < Number(results.subscriptions[0].courseRange.high)) {
            subscribed.isGood = true;
          }

          callback(err, subscribed);
        });
      }
    ],

    function (err, results) {
      //---- User only has one course let them build
      if (err && err.isGood) {
        return res.json(200, subscribed);
      }

      if (err) {
        return res.json(500, err);
      }
      return res.json(200, results);
    });
};

/**
 * updateCredit
 *
 */

var updateCredit = function (order, courseId, subscriptionId, desc, done) {

  async.waterfall([

      //--- Look for stripe customer exists
      function (callback) {
        Tier.getCredits(order.user._tier._company, function (err, results) {
          callback(err, results.credits);
        });
      },
      function (companyCredits, callback) {
        var newCredits = Number(companyCredits) + Number(order.addedCredits);
        Purchase.purchased(order, courseId, subscriptionId, desc, newCredits, function (err, results) {
          callback(err, results);
        });
      },
      function (customer, callback) {
        Tier.addCredits(order.user._tier._company, order.addedCredits, function (err, results) {
          callback(err, results);
        });
      }
    ],

    function (err, result) {
      done(err, result);
    });
};

/**
 * setSubscription
 *
 */

var setSubscription = function (subscription, price, customer, done) {

  async.waterfall([

      function (callback) {
        //------ Subscription does not exists, create one

        if (!customer.subscriptions || (customer.subscriptions && customer.subscriptions.count === 0)) {
          stripe.customers.createSubscription(String(customer.id), {
              plan: subscription._id
            },
            function (err, stripePlan) {
              callback(err, stripePlan);
            });
          //------ Subscription already exists, update it, stripe handles the payback
        } else {
          stripe.customers.updateSubscription(
            customer.id,
            customer.subscriptions.data[0].id, {
              plan: subscription._id
            },
            function (err, stripePlan) {
              callback(err, stripePlan);
            });
        }
      },
      function (stripePlan, callback) {
        Tier.setSubscription(customer.id, subscription._id, stripePlan.id, function (err, results) {
          callback(err);
        });
      }
    ],
    function (err, results) {
      done(err);
    });
};

/**
 * chargeSinglePayment
 *
 */

var chargeSinglePayment = function (price, customerId, desc, done) {
  stripe.charges.create({ //----- One time payment (for a course or adding credits)
    amount: price,
    currency: "usd",
    customer: customerId,
    description: desc
  }, function (err, results) {
    done(err);
  });
};

/**
 * retrieveAndOrCreateCustomer
 *
 */

var retrieveAndOrCreateCustomer = function (customerId, card, email, callback) {

  async.waterfall([

      function (callback) {
        stripe.customers.retrieve(customerId, function (err, customer) {
          if (customer) {
            callback(err, customer);
          } else {
            callback(null, null);
          }
        });
      }, //--- Check user exists

      function (customer, callback) {
        if (!customer) { //--- Customer does not exists, create
          stripe.customers.create({
            description: "Customer for Coursetto",
            email: email,
            id: customerId,
            card: card
          }, function (err, customer) {
            callback(err, customer);
          });

          /*} else if (customer.deleted) {
          stripe.customers.update(customer.id, {
            description: "Customer for Coursetto",
            email: email,
            card: card
          }, function (err, customer) {
            // asynchronously called
            callback(err, customer);
          });*/
        } else if (customer && !customer.default_card) { //---Customer exists but no active card
          stripe.customers.createCard(
            customer.id, {
              card: card
            },
            function (err, card) {
              callback(err, customer);
            }
          );

        } else {
          callback(null, customer); //Customer exists and has an active card
        }
      }
    ],
    function (err, results) {
      callback(err, results);
    });
};

/**
 * distributeCourseToTiers
 *
 */
var distributeCourseToTiers = function (tiers, courseId, callback) {
  async.map(tiers, function (tier, callback) {
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
};

/**
 * find customer from stripe
 *
 */

var findRecipient = function (req, res) {

  var id = req.params.id || req.query.id;

  stripe.recipients.retrieve(id, function (err, recipient) {
    if (err) {
      return res.json(204);
    }
    return res.json(200, null);

  });
};

/**
 * find customer from stripe
 *
 */

var createRecipient = function (req, res) {

  var recipient = req.body;

  stripe.recipients.create(recipient, function (err, recipient) {
    if (err) {
      return res.json(500, err);
    }
    return res.json(200, recipient);

  });
};

/**
 * find customer from stripe
 *
 */

var findCards = function (req, res) {

  var id = req.params.id || req.query.id;

  stripe.customers.retrieve(id, function (err, customer) {

    if (err) {
      return res.json(204);
    }

    if (customer && !customer.deleted) {
      return res.json(200, customer);
    } else {
      return res.json(200, null);
    }
  });
};

/**
 * deleteCard from stripe
 *
 */

var deleteCard = function (req, res) {

  var companyId = req.params.companyId || req.query.companyId;
  var cardId = req.params.cardId || req.query.cardId;

  stripe.customers.deleteCard(
    companyId,
    cardId,
    function (err, confirmation) {
      if (err) {
        return res.json(500, err);
      }
      return res.json(200, confirmation);
    }
  );
};

/**
 * getSubscriptions from stripe
 *
 */

var getSubscriptions = function (req, res) {

  async.waterfall([

      function (callback) {
        Subscription.find(function (err, results) {
          callback(err, results);
        });
      }
    ],
    function (err, results) {
      if (err) {
        return res.json(500, err);
      }
      return res.json(200, results);
    });
};

/**
 * cancelSubscription
 *
 */

var cancelSubscription = function (req, res) {

  var companyID = req.params.companyId || req.query.companyId;
  var subscriptionId = req.params.subscriptionId || req.query.subscriptionId;

  async.parallel([

      function (callback) {
        stripe.customers.cancelSubscription(
          companyID,
          subscriptionId,
          function (err, confirmation) {
            callback(err, confirmation);
          });
      },
      function (callback) {
        Tier.removeSubscription(companyID, subscriptionId, function (err, results) {
          callback(err, results);
        });
      }
    ],
    function (err, results) {
      if (err) {
        return res.json(500, err);
      }
      return res.json(200, results[0]);
    });
};

/**
 * find Credit history in local db
 *
 */

var findCredit = function (req, res) {

  var id = req.params.id || req.query.id;

  Tier.getCredits(id, function (err, result) {

    if (err) {
      return res.json(500, err);
    }
    //-- Change rounded number to money
    var money = Number(result.credits);
    var pennies = money * 100;
    result.credits = Math.ceil(pennies) / 100;

    return res.json(200, result);
  });
};

/**
 * purchase
 *
 */

var purchase = function (req, res) {

  var order = req.body,
    desc = "None",
    courseId = null,
    subscriptionId = null,
    price = Number(order.addedCredits) * 100,
    customerId = order.user._tier._company;

  if (order.courseId) { //-----------------------Check if course was purchesed
    desc = "Purchased Course " + order.courseId;
    courseId = order.courseId;
  } else if (order.subscription) { //------------- Check if subscription was purchesed
    subscriptionId = order.subscription._id;
    desc = "Subscription " + subscriptionId;
  } else { //------------------------------------- Credits were purchased
    desc = "Added Credits, userID " + order.user._id;
  }

  async.waterfall([

      //--- Look for stripe customer exists
      function (callback) {
        retrieveAndOrCreateCustomer(customerId, order.card, order.user.emails[0], function (err, customer) {
          callback(err, customer);
        });
      },
      function (customer, callback) {
        //----- Set up Subscrition or change single payment
        if (order.subscription) {
          setSubscription(order.subscription, price, customer, function (err, results) {
            callback(err);
          });
        } else {
          chargeSinglePayment(price, customerId, desc, function (err, results) {
            callback(err);
          });
        }
      },
      function (callback) {
        ///--- No need to update credits if it's a subscription purchase
        if (order.subscription) {
          callback(null);
        } else {
          updateCredit(order, courseId, subscriptionId, desc, function (err, results) {
            callback(err);
          });
        }

      }
    ],

    function (err, result) {

      if (err) {
        return res.json(200, err);
        //return res.json(200, err);
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
  storeCourses: storeCourses,
  checkCanAddCourse: checkCanAddCourse,
  createRecipient: createRecipient,
  findRecipient: findRecipient,
  deleteCard: deleteCard,
  getSubscriptions: getSubscriptions,
  cancelSubscription: cancelSubscription,
  findCredit: findCredit,
  purchase: purchase,
  findCards: findCards
};
