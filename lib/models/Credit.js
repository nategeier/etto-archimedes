"use strict";

var mongoose = require("mongoose"),
  Schema = mongoose.Schema;

/**
 * RecordSchema
 *
 */

var CreditSchema = new mongoose.Schema({

  _company: {
    type: Schema.ObjectId,
    ref: "Tier"
  },
  credits: {
    type: Number,
    default: 5
  },
  purchased: [{
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
    _course: {
      type: Schema.ObjectId,
      ref: "Course"
    }
  }],
  used: [{
    _user: {
      type: Schema.ObjectId,
      ref: "User"
    },
    date: {
      type: Date,
      default: Date.now
    },
    _course: {
      type: Schema.ObjectId,
      ref: "Course"
    },
    _Record: {
      type: Schema.ObjectId,
      ref: "Record"
    }
  }],
  recived: [{
    _company: {
      type: Schema.ObjectId,
      ref: "Tier"
    },
    credits: Number,
    amount: Number,
    date: {
      type: Date,
      default: Date.now
    },
    _course: {
      type: Schema.ObjectId,
      ref: "Course"
    }
  }]
});

var Credit = mongoose.model("Credit", CreditSchema);

Credit.findCredit = function (id, done) {

  if (typeof id === "string") {
    id = new mongoose.Types.ObjectId(id);
  }

  Credit.findOne({
    "_company": id
  }).populate("_company purchased.purchaser purchased._course").exec(function (err, user) {
    done(err, user);
  });
};

module.exports = Credit;
