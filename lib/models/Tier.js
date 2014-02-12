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
  internalId: String,
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
  _courses: [{
    type: Schema.ObjectId,
    ref: "Course"
  }]
});

var Tier = mongoose.model("Tier", TierSchema);

Tier.descendants = function (tierId, callback) {

  var id = tierId;
  if (typeof id === "string") {
    id = new mongoose.Types.ObjectId(id);
  }

  Tier.find({
    ancestors: id
  }, function (err, results) {
    callback(err, results);
  });
};

Tier.descendantsIds = function (tierId, callback) {

  var id = tierId;
  if (typeof id === "string") {
    id = new mongoose.Types.ObjectId(id);
  }

  Tier.find({
    ancestors: id
  }, "_id", function (err, results) {
    callback(err, results);
  });
};

Tier.ancestors = function (tierId, callback) {

  var id = tierId;
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

Tier.addCourse = function (tierId, courseId, callback) {

  if (typeof tierId === "string") {
    tierId = new mongoose.Types.ObjectId(tierId);
  }

  if (typeof courseId === "string") {
    courseId = new mongoose.Types.ObjectId(courseId);
  }

  Tier.update({
    _id: tierId
  }, {
    $addToSet: {
      _courses: courseId
    }
  }, function (err, results) {
    callback(err, results);
  });
};

Tier.findParent = function (parentId, callback) {
  this.findOne({
    _id: parentId
  }, function (err, results) {
    callback(err, results);
  });
};

Tier.listAllTiersWithCourse = function (tiers, courseId, callback) {
  this.find({
      $and: [{
        _id: {
          $in: tiers
        }
      }, {
        _courses: courseId
      }]
    }, "title",

    function (err, results) {
      callback(err, results);
    });
};

Tier.addChildToParent = function (parentId, tierId, callback) {

  if (typeof parentId === "string") {
    parentId = new mongoose.Types.ObjectId(parentId);
  }

  if (typeof tierId === "string") {
    tierId = new mongoose.Types.ObjectId(tierId);
  }

  this.update({
    _id: parentId
  }, {
    $addToSet: {
      _children: tierId
    }
  }, function (err, results) {
    callback(err, results);
  });
};

Tier.listChildrenTiers = function (parentId, callback) {
  Tier.find({
    parent: parentId
  }, function (err, results) {
    callback(err, results);
  });
};

Tier.addCourseAllDescendants = function (tierId, courseId, done) {

  if (typeof tierId === "string") {
    tierId = new mongoose.Types.ObjectId(tierId);
  }

  if (typeof courseId === "string") {
    courseId = new mongoose.Types.ObjectId(courseId);
  }

  async.parallel([

      function (callback) {
        Tier.addCourse(tierId, courseId, function (err, results) {
          callback(err, results);
        });
      },
      function (callback) {
        Tier.descendants(tierId, function (err, descendants) {

          async.map(descendants, function (child, callback) {
              Tier.addCourse(child._id, courseId, function (err, results) {
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
