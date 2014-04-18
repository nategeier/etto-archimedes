"use strict";

var mongoose = require("mongoose"),
  Schema = mongoose.Schema;

/**
 * RecordSchema
 *
 */

var PaymentSchema = new mongoose.Schema({
  companyCredits: Number,
  paid: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  credits: Number,
  _course: {
    type: Schema.ObjectId,
    ref: "Course"
  },
  _user: {
    type: Schema.ObjectId,
    ref: "User"
  },
  _company: {
    type: Schema.ObjectId,
    ref: "User"
  }
});

var Payment = mongoose.model("Payment", PaymentSchema);

Payment.giveCredits = function (companyId, userId, courseId, companyCredits, amount, done) {

  if (typeof companyId === "string") {
    companyId = new mongoose.Types.ObjectId(companyId);
  }

  if (typeof userId === "string") {
    userId = new mongoose.Types.ObjectId(userId);
  }

  if (typeof courseId === "string") {
    courseId = new mongoose.Types.ObjectId(courseId);
  }

  var newUsed = new Payment({
    "companyCredits": companyCredits,
    "_course": courseId,
    "_user": userId,
    "_company": companyId,
    "credits": amount
  });

  newUsed.save(function (err, results) {
    done(err, results);
  });
};

Payment.companyRecieved = function (companyId, done) {

  if (typeof companyId === "string") {
    companyId = new mongoose.Types.ObjectId(companyId);
  }

  var query = {
    _company: companyId
  };

  Payment.find(query).populate("_course", "title").exec(function (err, results) {
    done(err, results);
  });
};

module.exports = Payment;
