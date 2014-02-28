"use strict";

var mongoose = require("mongoose"),
  Schema = mongoose.Schema;

/**
 * RecordSchema
 *
 */

var PurchaseSchema = new mongoose.Schema({
  companyCredits: Number,
  _company: {
    type: Schema.ObjectId,
    ref: "Tier"
  },
  purchaser: {
    type: Schema.ObjectId,
    ref: "User"
  },
  credits: Number,
  amount: Number,
  date: {
    type: Date,
    default: Date.now
  },
  desc: String,
  _subscription: {
    type: Schema.ObjectId,
    ref: "Subscription"
  },
  _course: {
    type: Schema.ObjectId,
    ref: "Course"
  }
});

var Purchase = mongoose.model("Purchase", PurchaseSchema);

Purchase.purchased = function (order, courseId, subscriptionId, desc, companyCredits, done) {

  var companyId = order.user._tier._company;

  if (typeof companyId === "string") {
    companyId = new mongoose.Types.ObjectId(companyId);
  }

  if (typeof subscriptionId === "string") {
    subscriptionId = new mongoose.Types.ObjectId(subscriptionId);
  }

  if (typeof courseId === "string") {
    courseId = new mongoose.Types.ObjectId(courseId);
  }

  var newPurchase = new Purchase({
    "companyCredits": companyCredits,
    "_company": companyId,
    "purchaser": order.user._id,
    "credits": order.addedCredits,
    "amount": order.addedCredits,
    "_course": courseId,
    "_subscription": subscriptionId,
    "desc": desc
  });

  newPurchase.save(function (err, results) {
    done(err, results);
  });
};

module.exports = Purchase;
