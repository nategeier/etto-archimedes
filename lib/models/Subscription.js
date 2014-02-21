"use strict";

var mongoose = require("mongoose"),
  Schema = mongoose.Schema;

var async = require("async");

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

module.exports = Subscription;
