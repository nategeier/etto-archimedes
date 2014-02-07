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
    totalBlocks: {
      type: Number,
      default: 1
    },

    bookmark: {
      type: Number,
      default: 0
    },
    lastBlock: Schema.ObjectId
  },
  started: {
    type: Date,
    default: Date.now
  },
  lastUpdate: {
    type: Date,
    default: Date.now
  },
  completed: Date,
  points: {
    scored: Number,
    possible: Number
  },
  comments: String
});

var Record = mongoose.model("Record", RecordSchema);

Record.create = function (userId, courseId, done) {

  if (typeof userId === "string") {
    userId = new mongoose.Types.ObjectId(userId);
  }

  if (typeof courseId === "string") {
    courseId = new mongoose.Types.ObjectId(courseId);
  }

  var newRecord = new Record({
    _user: userId,
    _course: courseId
  });

  newRecord.save(function (err, results) {
    done(err, results);
  });
};

Record.checkIfCompleted = function (userId, courseId, done) {

  if (typeof userId === "string") {
    userId = new mongoose.Types.ObjectId(userId);
  }

  if (typeof courseId === "string") {
    courseId = new mongoose.Types.ObjectId(courseId);
  }

  Record.findOne({
    _user: userId,
    _course: courseId
  }, function (err, results) {
    done(err, results);
  });
};

module.exports = Record;
