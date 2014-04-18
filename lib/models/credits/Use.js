"use strict";

var mongoose = require("mongoose"),
  Schema = mongoose.Schema;

/**
 * RecordSchema
 *
 */

var UseSchema = new mongoose.Schema({
  companyCredits: Number,
  _user: {
    type: Schema.ObjectId,
    ref: "User"
  },
  _company: {
    type: Schema.ObjectId,
    ref: "Tier"
  },
  credits: Number,
  _course: {
    type: Schema.ObjectId,
    ref: "Course"
  },
  date: {
    type: Date,
    default: Date.now
  }
});

var Use = mongoose.model("Use", UseSchema);

Use.useCredits = function (userId, companyId, courseId, companyCredits, amount, done) {

  if (typeof companyId === "string") {
    companyId = new mongoose.Types.ObjectId(companyId);
  }

  if (typeof userId === "string") {
    userId = new mongoose.Types.ObjectId(userId);
  }

  if (typeof courseId === "string") {
    courseId = new mongoose.Types.ObjectId(courseId);
  }

  var newUsed = new Use({
    "companyCredits": companyCredits,
    "_user": userId,
    "_company": companyId,
    "_course": courseId,
    "credits": amount
  });

  newUsed.save(function (err, results) {
    done(err, results);
  });
};

Use.companyCredits = function (companyId, done) {

  if (typeof companyId === "string") {
    companyId = new mongoose.Types.ObjectId(companyId);
  }

  Use.aggregate({
    "$match": {
      "_company": companyId
    }
  }, {
    "$group": {
      "_id": "$_course",
      "total": {
        "$sum": "$credits"

      }
    },
  }, function (err, results) {
    done(err, results);
  });
};

module.exports = Use;
