"use strict";

var mongoose = require("mongoose"),
  Schema = mongoose.Schema;

/**
 * UserSchema
 *
 */
var TierSchema = new mongoose.Schema({
  title: String,
  parent: Schema.ObjectId,
  totUsers: Number,
  _children: [{
    type: Schema.ObjectId,
    ref: 'Tier'
  }],
  children: [],
  ancestors: [{
    type: Schema.ObjectId,
    ref: 'Tier'
  }],
  _users: [{
    type: Schema.ObjectId,
    ref: 'User'
  }],
  _courses: [{
    type: Schema.ObjectId,
    ref: 'CourseMeta'
  }]
});

var Tier = mongoose.model("Tier", TierSchema);

Tier.descendants = function (tierID, callback) {
  this.find({
    ancestors: tierID
  }, function (err, results) {
    callback(err, results);
  });
}

Tier.findParent = function (parentID, callback) {
  this.find({
    _id: parentID
  }, function (err, results) {
    callback(err, results);
  });
}

Tier.addChildToParent = function (parentID, tierID, callback) {
  this.update({
    _id: parentID
  }, {
    $addToSet: {
      _children: tierID
    }
  }, function (err, results) {
    callback(err, results);
  })
}

Tier.listChildrenTiers = function (parentID, callback) {
  Tier.find({
    parent: parentID
  }, function (err, results) {
    callback(err, results);
  });
}

module.exports = Tier;
