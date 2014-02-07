"use strict";

var mongoose = require("mongoose"),
  Schema = mongoose.Schema;

/**
 * UserSchema
 *
 */

var ReportSchema = new mongoose.Schema({
  _tier: {
    type: Schema.ObjectId,
    ref: "Tier"
  },
  _course: {
    type: Schema.ObjectId,
    ref: "Course"
  },
  _completed: [{
    type: Schema.ObjectId,
    ref: "User"
  }],
  _notCompleted: [{
    type: Schema.ObjectId,
    ref: "User"
  }]
});

var Report = mongoose.model("Report", ReportSchema);

Report.getCourseReportsForTier = function (id, done) {

  if (typeof id === "string") {
    id = new mongoose.Types.ObjectId(id);
  }

  Report.find({
    "_tier": id
  }).populate("_course", "title subtitle price").exec(function (err, course) {
    done(err, course);
  });
};

Report.ifExists = function (id, courseId, done) {

  if (typeof id === "string") {
    id = new mongoose.Types.ObjectId(id);
  }

  Report.findOne({
    "_tier": id,
    "_course": courseId
  }, function (err, course) {
    done(err, course);
  });
};

Report.findOrCreate = function (tierId, courseId, done) {

  if (typeof tierId === "string") {
    tierId = new mongoose.Types.ObjectId(tierId);
  }

  if (typeof courseId === "string") {
    courseId = new mongoose.Types.ObjectId(courseId);
  }

  var set = {
    $set: {
      _tier: tierId,
      _course: courseId
    }
  };

  Report.findOneAndUpdate({
    "_tier": tierId,
    "_course": courseId
  }, set, {
    upsert: true
  }, function (err, report) {
    done(err, report);
  });
};

Report.addUser = function (tierId, courseId, userId, done) {

  Report.ifExists(tierId, courseId, function (err, report) {

    if (report) {
      Report.update({
          _tier: tierId
        }, {
          $addToSet: {
            _notCompleted: userId
          }
        },

        function (err, results) {
          //------ saved
          done(err, results);
        });
    } else {
      done(null, null);
    }
  });
};

Report.completed = function (tierId, courseId, userId, done) {

  Report.ifExists(tierId, courseId, function (err, report) {

    if (report) {
      Report.update({
          _id: report._id
        }, {
          $addToSet: {
            _completed: userId
          },
          $pull: {
            _notCompleted: userId
          }
        },

        function (err, results) {
          //------ saved
          done(err, results);
        });
    } else {
      done(null, null);
    }
  });
};

module.exports = Report;
