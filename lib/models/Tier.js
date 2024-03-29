"use strict";

var mongoose = require("mongoose"),
  async = require("async"),
  Schema = mongoose.Schema;

/**
 * TierSchema
 *
 */

var TierSchema = new mongoose.Schema({
  title: String,
  internalId: String,
  parent: Schema.ObjectId,
  totUsers: Number,
  recipientId: String,
  trialEnds: {
    type: Date,
    default: "Wed Dec 22 2014 01:03:25 GMT-0500 (EST)"
  },
  credits: {
    type: Number,
    default: 0
  },
  _company: {
    type: Schema.ObjectId,
    ref: "Tier"
  },
  colors: {
    primary: {
      type: String,
      default: "#50889f"
    },
    secondary: {
      type: String,
      default: "#87b0c1"
    },
    accent: {
      type: String,
      default: "#daa45c"
    },
    light: {
      type: String,
      default: "#f0f6f8"
    },
  },
  font: {
    type: String,
    default: "Lato"
  },
  logo: {
    type: String,
    default: "/images/site/logo.png"
  },
  logoIsCompanyName: {
    type: Boolean,
    default: false
  },
  leaderboard: {
    title: {
      type: String,
      default: "Start creating, taking, and sharing courses"
    },
    subtitle: {
      type: String,
      default: "You can edit this message and image"
    },
    imgUrl: {
      type: String,
      default: "/images/leaderboard/default-lg.jpg"
    }
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
 *  updateLeaderboard
 -----
 *
 */

Tier.updateLeaderboard = function (id, leaderboard, logo, done) {

  if (typeof id === "string") {
    id = new mongoose.Types.ObjectId(id);
  }

  var query = {
    "_id": id
  };

  var update = {
    $set: {
      "leaderboard": leaderboard,
      "logo": logo
    }
  };

  Tier.findOneAndUpdate(query, update, function (err, users) {
    done(err, users);
  });
};


/**
 *  changeColors
 -----
 *
 */

Tier.changeColors = function (id, colors, font, done) {

  if (typeof id === "string") {
    id = new mongoose.Types.ObjectId(id);
  }

  var query = {
    "_id": id
  };

  var update = {
    $set: {
      "colors": colors,
      "font": font
    }
  };

  Tier.findOneAndUpdate(query, update, function (err, results) {
    done(err, results);
  });
};



/**
 *  Pull child from parent
 -----
 *
 */

Tier.pullChild = function (parentId, childId, done) {

  if (typeof parentId === "string") {
    parentId = new mongoose.Types.ObjectId(parentId);
  }

  if (typeof childId === "string") {
    childId = new mongoose.Types.ObjectId(childId);
  }

  Tier.update({
    _id: parentId
  }, {
    $pull: {
      _children: childId
    }
  }, function (err, result) {
    done(err);
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

  Tier.find(query, "title internalId", function (err, results) {
    done(err, results);
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


/**
 *  listAllCompanyTiers
 -----
 *
 */

Tier.listAllCompanyTiers = function (id, done) {

  if (typeof id === "string") {
    id = new mongoose.Types.ObjectId(id);
  }

  var query = {
    "_company": id
  };

  Tier.find(query, "_id", function (err, results) {
    done(err, results);
  });
};

/**
 *  Find a company
 -----
 *
 */

Tier.company = function (id, done) {

  if (typeof id === "string") {
    id = new mongoose.Types.ObjectId(id);
  }

  var query = {
    "_id": id
  };

  Tier.count(query, function (err, results) {
    done(err, results);
  });
};

/**
 *  checkTierIsLower
 -----
 *
 */

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

    if (results && funds.credits >= amountNeeded) {
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

Tier.removeSubscription = function (tierId, done) {

  if (typeof tierId === "string") {
    tierId = new mongoose.Types.ObjectId(tierId);
  }

  var query = {
    "_id": tierId
  };
  var update = {
    "$set": {
      "_subscription": null,
      "stripePlan": null
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
    "-_id ancestors",
    function (err, results) {
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
  }, "-_id _courses").populate("_courses", "title subtitle price thumb meta blocks priority").exec(function (err, results) {

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
 * Check if Child Exists
 -----
 *
 */

Tier.checkIfChildExists = function (parentId, title, callback) {

  if (typeof parentId === "string") {
    parentId = new mongoose.Types.ObjectId(parentId);
  }


  Tier.find({
      $and: [{
        parent: parentId
      }, {
        title: title
      }]

    },
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

/**
 * Remove a course from a tier
 -----
 *
 */

Tier.getCompany = function (tierId, done) {

  if (typeof tierId === "string") {
    tierId = new mongoose.Types.ObjectId(tierId);
  }

  async.waterfall([

      function (callback) {
        var query = {
          _id: tierId
        };

        Tier.findOne(query, function (err, results) {
          callback(err, results);
        });
      },
      function (tier, callback) {
        var query = {
          _id: tier._company
        };

        Tier.findOne(query).populate("_subscription", "title empRange").exec(function (err, company) {
          callback(err, company);
        });
      }
    ],
    function (err, company) {
      done(err, company);
    });
};

module.exports = Tier;
