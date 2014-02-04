"use strict";

var mongoose = require("mongoose"),
  Schema = mongoose.Schema;

/**
 * RecordSchema
 *
 */

var PurchaseSchema = new mongoose.Schema({
  _user: {
    type: Schema.ObjectId,
    ref: "User"
  },
  _course: {
    type: Schema.ObjectId,
    ref: "Course"
  },
  progress: {
    totalBlocks: Number,
    bookmark: Number
  },
  started: {
    type: Date,
    default: Date.now
  },
  lastUpdate: Date,
  completed: Date,
  points: {
    scored: Number,
    possible: Number
  }
});

var Purchase = mongoose.model("Purchase", PurchaseSchema);

module.exports = Purchase;
