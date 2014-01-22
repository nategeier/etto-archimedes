"use strict";

var mongoose = require("mongoose"),
  Schema = mongoose.Schema;

/**
 * RecordSchema
 *
 */


var RecordSchema = new mongoose.Schema({
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

var Record = mongoose.model("Record", RecordSchema);

module.exports = Record;