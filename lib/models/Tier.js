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
  recipientId: String,
  credits: {
    type: Number,
    default: 0
  },
  _company: {
    type: Schema.ObjectId,
    ref: "Tier"
  },
  leaderboard: {
    title: String,
    subtitle: String,
    imgUrl: String
  },
  _subscription: {
    type: Schema.ObjectId,
    ref: "Subscription"
  },
  stripePlan: String,
  _children: [{
    type: Schema.ObjectId,
    ref: "Tier"
  }],
  children: [],
  ancestors: [{
    type: Schema.ObjectId,
    ref: "Tier"
  }],
  _courses: [{
    type: Schema.ObjectId,
    ref: "Course"
  }]
});

var Tier = mongoose.model("Tier", TierSchema);

/**
 *  Find a tier
 -----
 *
 */

Tier.updateLeaderboard = function (id, leaderboard, done) {

  if (typeof id === "string") {
    id = new mongoose.Types.ObjectId(id);
  }

  var query = {
    "_id": id
  };

  var update = {
    $set: {
      "leaderboard": leaderboard
    }
  };

  Tier.findOneAndUpdate(query, update, function (err, users) {
    done(err, users);
  });
};

/**
 *  Find a tier
 -----
 *
 */

Tier.searchTier = function (txt, descendants, done) {

  var query = {
    "$or": [{
      "title": new RegExp("^" + txt + "$", "gi"),
      "_id": {
        "$in": descendants
      }
    }, {
      "internalId": new RegExp("^" + txt + "$", "gi"),
      "_id": {
        "$in": descendants
      }
    }]
  };

  Tier.find(query, "title internalId", function (err, users) {
    done(err, users);
  });
};

/**
 *  Find a tier
 -----
 *
 */

Tier.findTier = function (id, done) {

  if (typeof id === "string") {
    id = new mongoose.Types.ObjectId(id);
  }

  var query = {
    "_id": id
  };

  Tier.findOne(query, function (err, results) {
    done(err, results);
  });
};

Tier.checkTierIsLower = function (tierToCheck, userTierId, done) {

  Tier.ancestors(tierToCheck, function (err, results) {
    var found = false;
    async.map(results.ancestors, function (ancestorId, callback) {

      if (String(ancestorId) === String(userTierId)) {
        found = true;
      }
      callback();
    }, function () {

      if (found) {
        done(err, true);
      } else {
        done(err, false);
      }
    });
  });

};

/**
 *  List all Tiers descendants get all tiers data
 -----
 *
 */

Tier.getCredits = function (tierId, done) {

  var id = tierId;
  if (typeof id === "string") {
    id = new mongoose.Types.ObjectId(id);
  }

  Tier.findOne({
    _id: id
  }, "credits", function (err, results) {
    done(err, results);
  });
};

/**
 * addCredits
 -----
 *
 */

Tier.checkSufficientFunds = function (companyId, amountNeeded, done) {

  if (typeof companyId === "string") {
    companyId = new mongoose.Types.ObjectId(companyId);
  }

  Tier.findOne({
    "_id": companyId
  }, "credits", function (err, results) {
    if (err) {
      done(err, false);
    }

    var funds = {
      hasEnough: false,
      credits: results.credits
    };

    if (results && funds.credits > amountNeeded) {
      funds.hasEnough = true;
      done(err, funds);
    } else {
      done(err, funds);
    }

  });
};

/**
 *  Add company credits
 -----
 *
 */

Tier.addCredits = function (tierId, amount, callback) {

  if (typeof tierId === "string") {
    tierId = new mongoose.Types.ObjectId(tierId);
  }

  Tier.update({
    _id: tierId
  }, {
    "$inc": {
      credits: amount
    }
  }, function (err, results) {
    callback(err, results);
  });
};

/**
 *  Remove company credits
 -----
 *
 */

Tier.removeCredits = function (tierId, amount, callback) {

  if (typeof tierId === "string") {
    tierId = new mongoose.Types.ObjectId(tierId);
  }

  Tier.update({
    _id: tierId
  }, {
    "$inc": {
      credits: -amount
    }
  }, function (err, results) {
    callback(err, results);
  });
};

/**
 *  List all Tiers descendants get all tiers data
 -----
 *
 */

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

/**
 *  updateCredit
 -----
 *
 */

Tier.updateCredit = function (tierId, amount, callback) {

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

/**
 *  List all Tiers descendants, retrieve ID's only
 -----
 *
 */

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

/**
 *  setSubscription
 -----
 *
 */

Tier.setSubscription = function (tierId, subscriptionId, stripePlan, done) {

  if (typeof tierId === "string") {
    tierId = new mongoose.Types.ObjectId(tierId);
  }

  if (typeof subscriptionId === "string") {
    subscriptionId = new mongoose.Types.ObjectId(subscriptionId);
  }

  var query = {
    "_id": tierId
  };
  var update = {
    "$set": {
      "_subscription": subscriptionId,
      "stripePlan": stripePlan
    }
  };

  Tier.update(query, update, function (err, results) {
    done(err, results);
  });
};

/**
 *  removeSubscription
 -----
 *
 */

Tier.removeSubscription = function (tierId, subscriptionId, done) {

  if (typeof tierId === "string") {
    tierId = new mongoose.Types.ObjectId(tierId);
  }

  if (typeof subscriptionId === "string") {
    subscriptionId = new mongoose.Types.ObjectId(subscriptionId);
  }

  var query = {
    "_id": tierId
  };
  var update = {
    "$set": {
      "_subscription": null
    }
  };

  Tier.update(query, update, function (err, results) {
    done(err, results);
  });
};

/**
 *  List all Tiers ancestors
 -----
 *
 */

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

/**
 *  Find Parent Tier of a child
 -----
 *
 */

Tier.findParent = function (parentId, callback) {
  this.findOne({
    _id: parentId
  }, function (err, results) {
    callback(err, results);
  });
};

/**
 *  Find Company Tier of a child
 -----
 *
 */

Tier.findCompany = function (tierId, callback) {
  async.waterfall([

      function (callback) {
        Tier.findOne({
          _id: tierId
        }, function (err, results) {
          callback(err, results);
        });
      }
    ],
    function (err, tier) {
      Tier.findOne({
        _id: tier._company
      }, function (err, results) {
        callback(err, results);
      });

    });
};

/**
 *
 -----listTierCourses
 *
 */

Tier.listTierCourses = function (id, callback) {

  if (typeof id === "string") {
    id = new mongoose.Types.ObjectId(id);
  }

  Tier.findOne({
    _id: id
  }, "-_id _courses").populate("_courses", "title subtitle price").exec(function (err, results) {

    callback(err, results._courses);
  });
};

/**
 *
 -----listAllTiersWithCourse
 *
 */

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

/**
 * Add a child tier to a parent
 -----
 *
 */

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

/**
 * listChildrenTiers
 onlyu lists direct children, not decendents
 -----
 *
 */

Tier.listChildrenTiers = function (parentId, callback) {
  Tier.find({
    parent: parentId
  }, function (err, results) {
    callback(err, results);
  });
};

/**
 * Add a course to a tier
 -----
 *
 */

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

/**
 * Add a course to a tier and all its decendents
 -----
 *
 */

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

/**
 * Remove a course from a tier
 -----
 *
 */

Tier.removeCourse = function (tierId, courseId, callback) {

  if (typeof tierId === "string") {
    tierId = new mongoose.Types.ObjectId(tierId);
  }

  if (typeof courseId === "string") {
    courseId = new mongoose.Types.ObjectId(courseId);
  }

  Tier.update({
    _id: tierId
  }, {
    $pull: {
      _courses: courseId
    }
  }, function (err, results) {
    callback(err, results);
  });
};

/**
 * Add a course to a tier and all its decendents
 -----
 *
 */

Tier.removeCourseFromDescendants = function (tierId, courseId, done) {

  if (typeof tierId === "string") {
    tierId = new mongoose.Types.ObjectId(tierId);
  }

  if (typeof courseId === "string") {
    courseId = new mongoose.Types.ObjectId(courseId);
  }

  async.parallel([

      function (callback) {
        Tier.removeCourse(tierId, courseId, function (err, results) {
          callback(err, results);
        });
      },
      function (callback) {
        Tier.descendants(tierId, function (err, descendants) {

          async.map(descendants, function (child, callback) {
              Tier.removeCourse(child._id, courseId, function (err, results) {
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
