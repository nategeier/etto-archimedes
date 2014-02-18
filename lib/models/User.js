"use strict";

var mongoose = require("mongoose"),
  Schema = mongoose.Schema;

/**
 * UserSchema
 *
 */
var UserSchema = new mongoose.Schema({
  name: String,
  email: [{
    type: String,
  }],
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
      default: true
    },
    canCreateCourses: {
      type: Boolean,
      default: true
    },
    canGetCourses: {
      type: Boolean,
      default: true
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

User.checkUsernameExists = function (username, done) {

  User.findOne({
    username: username
  }, function (err, user) {
    done(err, user);
  });
};

User.countUsersInTier = function (tierId, done) {

  User.count({
    _tier: tierId
  }, function (err, result) {
    done(err, result);
  });
};

User.getLowerUsers = function (tiers, done) {

  User.find({
    _tier: {
      $in: tiers
    }
  }, "name email", function (err, result) {
    done(err, result);
  });
};

User.getUsersInTier = function (tierId, done) {

  User.find({
    _tier: tierId
  }, "email name", function (err, results) {
    done(err, results);
  });
};

User.getUsersInTiers = function (tiers, done) {

  User.find({
    _tier: {
      $in: tiers
    }
  }, "email name", function (err, results) {
    done(err, results);
  });

};

module.exports = User;
