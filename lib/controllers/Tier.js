"use strict";

var log = require("npmlog");

var async = require("async"),
  _ = require("underscore"),
  mongoose = require("mongoose"),
  User = require("../models/User"),
  Tier = require("../models/Tier");

/**
 * updateLeaderboard
 ----- 
 *
 */

var updateLeaderboard = function (req, res) {

  var id = req.body._id;
  var leaderboard = req.body.leaderboard;

  async.waterfall([

      function (callback) {
        Tier.updateLeaderboard(id, leaderboard, function (err, results) {
          callback(err, results);
        });
      }
    ],
    function (err, results) {

      if (err) {
        return res.json(500, err);
      }
      // Otherwise return the array of found objects
      return res.json(200, results);
    });
};

/**
 * searchTiers
 ----- 
 Searches all of the lower tiers
 *
 */

var searchTiers = function (req, res) {

  var searchTxt = req.params.text || req.query.text;

  var userTierId = req.session.user._tier._id;

  async.waterfall([

      function (callback) {
        Tier.descendants(userTierId, function (err, results) {
          callback(err, results);
        });

      },
      function (descendants, callback) {
        Tier.searchTier(searchTxt, descendants, function (err, results) {
          callback(err, results);
        });
      }
    ],
    function (err, results) {
      if (err) {
        return res.json(500, err);
      }
      // Otherwise return the array of found objects
      return res.json(200, results);
    });
};

/**
 * checkTierAccess
 -----
 *
 */

var checkTierAccess = function (req, res) {

  var id = req.params.id || req.query.id;
  var userTierId = req.session.user._tier._id;

  Tier.ancestors(id, function (err, results) {
    var found = false;
    async.map(results.ancestors, function (ancestorId, callback) {

      if (String(ancestorId) === String(userTierId)) {
        found = true;
      }
      callback();

    }, function () {

      if (found) {
        return res.json(201);
      } else {
        return res.json(401);
      }
    });
  });
};

/**
 * Find all tiers
 -----
 *
 */

var find = function (req, res) {

  var id = req.params.id || req.query.id;

  async.waterfall([

      function (callback) {
        Tier.findTier(id, function (err, tier) {
          callback(err, tier);
        });
      }
    ],
    function (err, results) {
      if (err) {
        return res.json(401, "Not Found");
      }
      // Otherwise return the array of found objects
      return res.json(200, results);
    });
};

/**
 * Add a course to a tier
 -----
 *
 */

var addCourseToTier = function (req, res) {

  var tierId = req.params.tierId || req.query.tierId;
  var courseId = req.params.courseId || req.query.courseId;
  var addAllLowerTiers = req.params.addAllLowerTiers || req.query.addAllLowerTiers;

  if (addAllLowerTiers === true || addAllLowerTiers === "true") {
    Tier.addCourseAllDescendants(tierId, courseId, function (err) {
      if (err) {
        return res.json(500, "Error");
      }
      return res.json(201);
    });
  } else {
    Tier.addCourse(tierId, courseId, function (err) {
      if (err) {
        return res.json(500, "Error");
      }
      return res.json(201);
    });
  }
};

/**
 * Remove a course to a tier
 -----
 *
 */

var removeCourseFromTiers = function (req, res) {

  var tierId = req.params.tierId || req.query.tierId;
  var courseId = req.params.courseId || req.query.courseId;

  Tier.removeCourseFromDescendants(tierId, courseId, function (err, results) {
    if (err) {
      return res.json(500, "Error");
    }
    return res.json(201);
  });

};

/**
 * Update a tier
 -----
 *
 */

var update = function (req, res) {

  var query = {},
    update = {};

  var id = req.body._id,
    internalId = req.body.internalId;

  if (!internalId) {
    internalId = null;
  }

  if (id) {
    if (typeof id === "string") {
      id = new mongoose.Types.ObjectId(id);
    }

    query = {
      "_id": id
    };

    update = {
      $set: {
        title: req.body.title,
        internalId: internalId
      }
    };
  }

  Tier.findOneAndUpdate(query, update, function (err, tier) {

    if (err) {
      return res.json(500, err);
    }
    return res.json(200, tier);

  });
};

/**
 * Create a top tier or a compnay/brand
 -----
 *
 */

var createCompany = function (req, res) {

  var newTier = new Tier(req.body);

  newTier.save(function (err, results) {

    Tier.findOneAndUpdate({
      "_id": results._id
    }, {
      $set: {
        _company: results._id
      }
    }, function (err, tier) {
      // Otherwise return the array of found objects
      return res.json(200, tier);

    });
  });
};

/**
 * Add a tier
 *
 */

var add = function (req, res) {

  var newTier = new Tier(req.body);

  async.waterfall([

      function (callback) {

        //---  Add parents ancestors to the new tier
        if (newTier.parent) {

          Tier.findParent(newTier.parent, function (err, results) {
            if (results) {
              if (!newTier._company) {
                newTier._company = results._company;
              }
              newTier.ancestors = results.ancestors;
              newTier._courses = results.courses;
              newTier.ancestors.push(newTier.parent);
            }
            callback(err, newTier);
          });

        } else {
          callback(null, newTier);
        }
      },

      function (newTier, callback) {
        newTier.save(function (err, results) {
          callback(err, results);
        });
      },
      //---- Add the newly created child to parent
      function (tier, callback) {
        if (newTier.parent) {
          Tier.addChildToParent(tier.parent, tier._id, function (err, results) {
            callback(err, tier);
          });
        } else {
          callback(null, tier);
        }
      }
    ],
    function (err, results) {
      if (err) {
        return res.json(500, "Error");
      } else {
        return res.json(200, results);
      }

    });
};

/**
 * List all children of a tier and count users in each
 -----
 *
 */

var listChildrenAndCountUsers = function (req, res) {

  var teirID = req.body._id;

  async.waterfall([

      function (callback) {
        if (teirID) {
          Tier.listChildrenTiers(teirID, function (err, children) {
            callback(err, children);
          });
        } else {
          callback("Tier is null");
        }
      },
      function (children, callback) {
        //----- Check if the level has children
        if (children && children[0]) {
          async.map(children, function (tier, callback) {
            var totalUsers = 0;

            async.waterfall([

                //----- Count top tier users
                function (callback) {
                  User.countUsersInTier(tier._id, function (err, result) {
                    totalUsers = Number(result);
                    tier.totUsers = Number(result);
                    callback(err);
                  });
                },
                function (callback) {

                  Tier.descendants(tier._id, function (err, results) {
                    callback(err, results);
                  });
                },
                function (allTiers, callback) {
                  async.map(allTiers, function (child, callback) {
                    User.countUsersInTier(child._id, function (err, result) {
                      totalUsers += Number(result);
                      tier.totUsers = tier.totUsers + Number(result);
                      callback(null, null);
                    });
                  }, function (err) {
                    callback(err);
                  });
                }
              ],
              function (err, result) {
                callback(err, totalUsers);
              });
          }, function (err, results) {
            callback(null, children);
          });
        } else {
          callback(null, null);
        }
      }
    ],
    function (err, results) {
      if (err) {
        log.error("req", err);
        return res.json(500, "Error");
      } else if (!results) {
        return res.json(200, []);
      }
      return res.json(200, results);

    });
};

/**
### Tier removal
 -----
 ** Removes tier and all decencent tiers
 ** Post full tier object with _id inside

 Example
 ```
 {"title" : "Something", "_id" : "636363738388383"}
 ```

 *
 */

var remove = function (req, res) {

  var tier = req.body;

  async.waterfall([

      function (callback) {
        Tier.descendants(tier._id, function (err, results) {
          callback(err, results);
        });
      },
      function (allTiers, callback) {

        if (allTiers && allTiers[0]) {
          async.map(allTiers, function (tier, callback) {
            //---- Remove all of the tiers decendents
            Tier.remove({
              _id: tier._id
            }, function (err, result) {
              callback(null, null);
            });
          }, function (err, results) {
            callback(null);
          });

        } else {
          callback(null);
        }
      },
      function (callback) {
        //---- Remove tier called
        if (typeof tier.parent === "string") {
          tier.parent = new mongoose.Types.ObjectId(tier.parent);
        }

        if (typeof tier._id === "string") {
          tier._id = new mongoose.Types.ObjectId(tier._id);
        }

        Tier.update({
          _id: tier.parent
        }, {
          $pull: {
            _children: tier._id
          }
        }, function (err, result) {
          callback(err);
        });
      },
      function (callback) {

        //---- Remove tier called
        Tier.remove({
          _id: tier._id
        }, function (err, result) {
          callback(err, result);
        });
      }
    ],
    function (err, result) {
      if (err) {
        log.error("req", err);
        return res.json(500);
      }

      if (result === 1) {
        return res.json(200);
      } else {
        return res.json(404);
      }

    });
};

/**
 * distributeCourseToTiers
 *
 */
var distributeCourseToTiers = function (req, res) {

  var tiers = req.body.tiers;
  var courseId = req.body.courseId;

  async.map(tiers, function (tier, callback) {
      //--------- Tier closed, but is on and has childen, update tier and all it's decendence to have course
      if (tier.minimized === true && tier.hasChildren === true && tier.hasAddedChildren === false) {

        //--- Create top tier report
        Tier.addCourseAllDescendants(tier._id, courseId, function (err, results) {
          //--- Create all decendents tiers report
          callback(err, results);
        });
        //--------- Tier closed, but no childen or is off
      } else if ((tier.minimized === true && tier.hasChildren === false) || (tier.minimized === true && tier.hasAddedChildren === true) || (tier.minimized === false)) {
        Tier.addCourse(tier._id, courseId, function (err, results) {
          callback(err, results);
        });
      } else {
        callback(null, null);
      }
    },
    function (err, results) {
      if (err) {
        log.error("req", err);
        return res.json(500);
      }
      return res.json(200);
    });
};

/**
### Exports
 -----
 *
 */

module.exports = {
  updateLeaderboard: updateLeaderboard,
  searchTiers: searchTiers,
  checkTierAccess: checkTierAccess,
  find: find,
  update: update,
  createCompany: createCompany,
  addCourseToTier: addCourseToTier,
  removeCourseFromTiers: removeCourseFromTiers,
  add: add,
  listChildrenAndCountUsers: listChildrenAndCountUsers,
  remove: remove,
  distributeCourseToTiers: distributeCourseToTiers
};
