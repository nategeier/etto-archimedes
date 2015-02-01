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
      default: 1
    }
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
  progress = progress || {
    "bookmark": 1,
    "totalBlocks": 1
  };



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
    "_user": userId,
    "_tier": tierId,
    "_course": courseId,
    "progress.bookmark": progress.bookmark,
    "progress.totalBlocks": progress.totalBlocks
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

Record.getUsersRecords = function (userId, done) {

  if (typeof userId === "string") {
    userId = new mongoose.Types.ObjectId(userId);
  }

  Record.find({
    _user: userId
  }).populate("_course", "title").exec(function (err, results) {
    done(err, results);
  });
};

Record.updateBookmark = function (id, bookmark, totalBlocks, done) {

  if (typeof id === "string") {
    id = new mongoose.Types.ObjectId(id);
  }

  var completed = null;

  //--- Mark record as completed if they made it to the end
  if (bookmark === totalBlocks) {
    completed = Date.now();
  }

  var query = {
    "_id": id
  };

  var update = {
    "$set": {
      "progress.bookmark": bookmark,
      "progress.totalBlocks": totalBlocks,
      "completed": completed
    }
  };

  Record.findOneAndUpdate(query, update, function (err, results) {
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
    _course: courseId,
    completed: {
      "$ne": null
    }
  }, function (err, results) {
    done(err, results);
  });
};

module.exports = Record;
