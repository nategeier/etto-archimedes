"use strict";

var mongoose = require("mongoose");

/**
 * RecordSchema
 *
 */

var SubscriptionSchema = new mongoose.Schema({
  "title": String,
  "price": Number,

  "empRange": {
    "low": Number,
    "high": Number
  }
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
    "_id": id
  };

  this.findOne(query, function (err, results) {
    done(err, results);
  });
};

module.exports = Subscription;
