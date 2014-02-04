"use strict";

var mongoose = require("mongoose"),
  async = require("async"),
  Schema = mongoose.Schema;

/**
 * UserSchema
 *
 */

var TierSchema = new mongoose.Schema({
  title: String,
  parent: Schema.ObjectId,
  totUsers: Number,
  _company: {
    type: Schema.ObjectId,
    ref: "Tier"
  },
  _children: [{
    type: Schema.ObjectId,
    ref: "Tier"
  }],
  children: [],
  ancestors: [{
    type: Schema.ObjectId,
    ref: "Tier"
  }],
  _users: [{
    type: Schema.ObjectId,
    ref: "User"
  }],
  _courses: []
});

var Tier = mongoose.model("Tier", TierSchema);

Tier.descendants = function (tierID, callback) {

  var id = tierID;
  if (typeof id === "string") {
    id = new mongoose.Types.ObjectId(id);
  }

  Tier.find({
    ancestors: id
  }, function (err, results) {
    callback(err, results);
  });
};

Tier.ancestors = function (tierID, callback) {

  var id = tierID;
  if (typeof id === "string") {
    id = new mongoose.Types.ObjectId(id);
  }

  Tier.findOne({
      _id: id
    },
    "-_id ancestors", function (err, results) {
      callback(err, results);
    });
};

Tier.addCourse = function (tierID, courseID, callback) {
  Tier.update({
    _id: tierID
  }, {
    $addToSet: {
      _courses: courseID
    }
  }, function (err, results) {
    callback(err, results);
  });
};

Tier.findParent = function (parentID, callback) {
  this.find({
    _id: parentID
  }, function (err, results) {
    callback(err, results);
  });
};

Tier.addChildToParent = function (parentID, tierID, callback) {
  this.update({
    _id: parentID
  }, {
    $addToSet: {
      _children: tierID
    }
  }, function (err, results) {
    callback(err, results);
  });
};

Tier.listChildrenTiers = function (parentID, callback) {
  Tier.find({
    parent: parentID
  }, function (err, results) {
    callback(err, results);
  });
};

Tier.addCourseAllDescendants = function (tierID, courseID, done) {
  async.parallel([

      function (callback) {
        Tier.addCourse(tierID, courseID, function (err, results) {
          callback(err, results);
        });
      },
      function (callback) {
        Tier.descendants(tierID, function (err, descendants) {

          async.map(descendants, function (child, callback) {
              Tier.addCourse(child._id, courseID, function (err, results) {
                callback(err, results);
              });
            },
            function (err, results) {
              callback(err, results);
            });
        });
      }
    ],
    function (err, results) {
      done(err, results);
    });
};

module.exports = Tier;
