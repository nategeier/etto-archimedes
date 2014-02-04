"use strict";

var mongoose = require("mongoose"),
  Schema = mongoose.Schema;

/**
 * UserSchema
 *
 */
var UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  provider: String,
  enabled: Boolean,
  avatarUrl: String,
  _tier: {
    type: Schema.ObjectId,
    ref: "Tier"
  },
  created: {
    type: Date,
    default: Date.now
  },
  _createdCourses: [{
    type: Schema.ObjectId,
    ref: "Course"
  }],
  _needToTakeCourses: [{
    type: Schema.ObjectId,
    ref: "Course"
  }],

  meta: {
    votes: Number,
    favs: Number
  },
  auth: {
    canPurchase: {
      type: Boolean,
      default: false
    },
    canCreateCourses: {
      type: Boolean,
      default: false
    },
    canGetCourses: {
      type: Boolean,
      default: false
    },
    canInvite: {
      type: Boolean,
      default: true
    }
  },
  username: String,
  hash: String,
  salt: String
});

var User = mongoose.model("User", UserSchema);

User.countUsersInTier = function (tierID, callback) {

  User.count({
    _tier: tierID
  }, function (err, result) {
    callback(err, result);
  });
};

module.exports = User;
