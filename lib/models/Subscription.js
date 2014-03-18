"use strict";

var mongoose = require("mongoose");

/**
 * RecordSchema
 *
 */

var SubscriptionSchema = new mongoose.Schema({
  "title": String,
  "empRange": {
    "low": Number,
    "high": Number
  },
  "subscriptions": [{
    "courseRange": {
      "low": Number,
      "high": Number
    },
    "price": Number
  }, {
    "courseRange": {
      "low": Number,
      "high": Number
    },
    "price": Number
  }, {
    "courseRange": {
      "low": Number,
      "high": Number
    },
    "price": Number
  }]
});

var Subscription = mongoose.model("Subscription", SubscriptionSchema);

/**
 *  Find a Subscription
 -----
 *
 */

Subscription.findSubscription = function (id, done) {

  if (typeof id === "string") {
    id = new mongoose.Types.ObjectId(id);
  }

  var query = {
    "subscriptions._id": id
  };

  this.findOne(query, {
    "subscriptions.$": 1
  }, function (err, results) {
    done(err, results);
  });
};

module.exports = Subscription;
