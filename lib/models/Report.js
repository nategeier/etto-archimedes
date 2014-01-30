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
    "_tier": id
  }).where("_course").equals(courseId).exec(function (err, course) {
    done(err, course);
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
          _tier: tierId
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
