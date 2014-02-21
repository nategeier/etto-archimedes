"use strict";

var mongoose = require("mongoose"),
  Schema = mongoose.Schema;

/**
 * UserSchema
 *
 */
var TransactionSchema = new mongoose.Schema({

  _company: {
    type: Schema.ObjectId,
    ref: "Tier"
  },
  varifyAmounts: {
    first: Number,
    second: Number
  },
  created: {
    type: Date,
    default: Date.now
  },
  payments: [{
    paid: Date,
    amount: Number,
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
  }]
});

var Transaction = mongoose.model("Transaction", TransactionSchema);

module.exports = Transaction;
