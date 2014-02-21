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
  _tier: {
    type: Schema.ObjectId,
    ref: "Tier"
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

Record.create = function (userId, courseId, tierId, progress, done) {

  if (typeof userId === "string") {
    userId = new mongoose.Types.ObjectId(userId);
  }

  if (typeof courseId === "string") {
    courseId = new mongoose.Types.ObjectId(courseId);
  }

  if (typeof tierId === "string") {
    tierId = new mongoose.Types.ObjectId(tierId);
  }

  var newRecord = new Record({
    _user: userId,
    _tier: tierId,
    _course: courseId,
    progress: progress
  });

  newRecord.save(function (err, results) {
    done(err, results);
  });

};

Record.getAllUsersCourseRecords = function (users, courseId, done) {

  if (typeof courseId === "string") {
    courseId = new mongoose.Types.ObjectId(courseId);
  }

  Record.find({
      $and: [{
        _user: {
          $in: users
        },
        _course: courseId
      }]
    },

    function (err, results) {
      done(err, results);
    });
};

Record.updateBookmark = function (id, bookmark, totalBlocks, done) {

  if (typeof id === "string") {
    id = new mongoose.Types.ObjectId(id);
  }

  var query = {
    "_id": id
  };

  var update = {
    "$set": {
      "progress.bookmark": bookmark,
      "progress.totalBlocks": totalBlocks
    }
  };

  Record.update(query, update, function (err, results) {
    done(err, results);
  });
};

Record.userBestCourseRecord = function (userId, courseId, done) {

  if (typeof userId === "string") {
    userId = new mongoose.Types.ObjectId(userId);
  }

  if (typeof courseId === "string") {
    courseId = new mongoose.Types.ObjectId(courseId);
  }

  var query = {
    "$and": [{
      "_user": userId
    }, {
      "_course": courseId
    }]
  };

  Record.findOne(query).sort("-progress.bookmark").exec(function (err, results) {
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
