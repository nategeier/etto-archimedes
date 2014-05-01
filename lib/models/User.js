"use strict";

var mongoose = require("mongoose"),
  Schema = mongoose.Schema;

/**
 * UserSchema
 *
 */
var UserSchema = new mongoose.Schema({
  name: String,
  isBeta: {
    type: Boolean,
    default: false
  },
  emails: [{
    type: String,
  }],
  provider: String,
  enabled: Boolean,
  avatarUrl: {
    type: String,
    default: ""
  },
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
    votes: {
      type: Number,
      default: 1
    },
    favs: {
      type: Number,
      default: 1
    }
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
    },
    canEditCompany: {
      type: Boolean,
      default: true
    }
  },
  username: String,
  hash: String,
  salt: String
});

var User = mongoose.model("User", UserSchema);

User.searchUser = function (txt, done) {

  var query = {
    "$or": [{
      "name": new RegExp("^" + txt + "$", "gi")
    }, {
      "emails": new RegExp("^" + txt + "$", "gi")
    }]
  };

  User.find(query, "name", function (err, users) {
    done(err, users);
  });
};

User.checkUsernameExists = function (username, done) {

  User.findOne({
    username: new RegExp(username, "i")
  }, function (err, user) {
    done(err, user);
  });
};

User.getUserFromId = function (id, done) {

  if (typeof id === "string") {
    id = new mongoose.Types.ObjectId(id);
  }

  User.findOne({
    _id: id
  }, "name isBeta _tier").populate("_tier").exec(function (err, user) {
    done(err, user);
  });
};

User.updatePassword = function (id, password, done) {

  if (typeof id === "string") {
    id = new mongoose.Types.ObjectId(id);
  }

  var query = {
    _id: id
  };

  var update = {
    $set: {
      hash: password
    }
  };

  User.update(query, update, function (err, user) {
    done(err, user);
  });
};

User.checkEmailExists = function (email, done) {

  User.findOne({
    emails: new RegExp(email, "i")
  }, "name emails", function (err, user) {
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
  }, "name emails", function (err, result) {
    done(err, result);
  });
};

User.getUsersInTier = function (tierId, done) {

  User.find({
    _tier: tierId
  }, "emails name", function (err, results) {
    done(err, results);
  });
};

User.getUsersInTiers = function (tiers, done) {

  User.find({
    _tier: {
      $in: tiers
    }
  }, "emails name", function (err, results) {
    done(err, results);
  });
};

User.getUserTier = function (userId, done) {

  User.findOne({
    _id: userId
  }, "_tier").populate("_tier").exec(function (err, user) {
    done(err, user);
  });
};

User.getUserInfo = function (id, done) {

  if (typeof id === "string") {
    id = new mongoose.Types.ObjectId(id);
  }

  User.findOne({
    _id: id
  }).populate("_tier").exec(function (err, user) {
    done(err, user);
  });
};

module.exports = User;
