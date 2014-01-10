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
  username: String,
  provider: String,
  enabled: Boolean,
  avatar_url: String,
  _tier: {
    type: Schema.ObjectId,
    ref: 'Tier'
  },
  created: {
    type: Date,
    default: Date.now
  },
  _createdCourses: [{
    type: Schema.ObjectId,
    ref: "Course_meta_data"
  }],
  _needToTakeCourses: [{
    type: Schema.ObjectId,
    ref: "Course_meta_data"
  }],
  hashed_password: String,
  meta: {
    votes: Number,
    favs: Number
  },
  salt: String
});

var User = mongoose.model("User", UserSchema);

User.countUsersInTier = function (tierID, callback) {
  this.count({
    _tier: tierID
  }, function (err, result) {
    callback(err, result);
  })
};

module.exports = User;
