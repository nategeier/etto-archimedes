"use strict";

var log = require("npmlog");

var async = require("async"),
  mongoose = require("mongoose"),
  User = require("../models/User"),
  Tier = require("../models/Tier");

var config = require("../server/config"),
  baseUrl = (config.get("baseurl"));


//---- Services 
var Dates = require("../services/dates"),
  Email = require("../services/email");

/**
 * updateLeaderboard
 ----- 
 *
 */

var updateLeaderboard = function (req, res) {

  var id = req.body._id;
  var leaderboard = req.body.leaderboard;
  var logo = req.body.logo;

  Tier.updateLeaderboard(id, leaderboard, logo, function (err, results) {
    if (err) {
      return res.json(500, err);
    }
    return res.json(200, results);
  });
};


/**
 * changeColors
 ----- 
 *
 */

var changeWhiteLabel = function (req, res) {

  var id = req.body._id;
  var colors = req.body.colors;
  var font = req.body.font;


  Tier.changeColors(id, colors, font, function (err, results) {
    if (err) {
      return res.json(500, err);
    }
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
        Tier.findTier(userTierId, function (err, results) {
          callback(err, results);
        });
      },

      function (usersTier, callback) {
        Tier.descendants(userTierId, function (err, results) {
          results.push(usersTier);
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
      return res.json(200, results);
    });
};

/**
 * Find all tiers
 -----
 *
 */

var find = function (req, res) {

  var id = req.params.id || req.query.id;

  Tier.findTier(id, function (err, results) {
    if (err) {
      return res.json(401, "Not Found");
    }
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

  // Determin if the course is just for a tier or all of its children  
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

  var query = {};
  var id = req.body._id;



  if (id) {
    if (typeof id === "string") {
      id = new mongoose.Types.ObjectId(req.body._id);
    }

    query = {
      "_id": id
    };
  }

  delete req.body._id;
  delete req.body.$promise;
  delete req.body.$resolved;



  Tier.findOneAndUpdate(query, req.body, function (err, tier) {

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

  var fortnightAwayDate = Dates.fortnightAway();

  newTier.save(function (err, results) {

    Tier.findOneAndUpdate({
      "_id": results._id
    }, {
      $set: {
        _company: results._id,
        trialEnds: fortnightAwayDate
      }
    }, function (err, tier) {
      // Otherwise return the array of found objects
      return res.json(200, tier);

    });
  });
};



/**
 * addPartentsAncesstorsToTier
 *
 */

var addPartentsAncesstorsToTier = function (newTier, done) {

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
      done(err, newTier);
    });

  } else {
    done(null, newTier);
  }

};

/**
 * Add a tier
 *
 */

var add = function (req, res) {

  var newTier = new Tier(req.body);

  async.waterfall([

      function (done) {
        addPartentsAncesstorsToTier(newTier, function (err, results) {
          done(err, results);
        });
      },

      function (newTier, done) {
        newTier.save(function (err, results) {
          done(err, results);
        });
      },
      //---- Add the newly created child to parent
      function (tier, done) {
        if (newTier.parent) {
          Tier.addChildToParent(tier.parent, tier._id, function (err, results) {
            done(err, tier);
          });
        } else {
          done(null, tier);
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
 * countUsersInAllTiers
 *
 */


var countUsersInAllTiers = function (allTiers, totalUsers, tier, done) {

  async.map(allTiers, function (child, callback) {
    User.countUsersInTier(child._id, function (err, result) {
      totalUsers += Number(result);
      tier.totUsers = tier.totUsers + Number(result);
      callback(null, null);
    });
  }, function (err) {
    done(err, totalUsers);
  });
};


/**
 * countTotalUsersRecursively
 -----
 *
 */


var countTotalUsersRecursively = function (tier, done) {

  var totalUsers = 0;

  async.waterfall([

      //----- Count top tier users
      function (callback) {
        User.countUsersInTier(tier._id, function (err, result) {
          totalUsers = Number(result);
          callback(err);
        });
      },
      function (callback) {
        Tier.descendants(tier._id, function (err, results) {
          callback(err, results);
        });
      },
      function (allTiers, callback) {
        countUsersInAllTiers(allTiers, totalUsers, tier, function (err, results) {
          callback(err, results);
        });
      }
    ],
    function (err, result) {
      done(err, totalUsers);
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
            countTotalUsersRecursively(tier, function (err, results) {
              tier.totUsers = Number(results);
              callback(err, tier);
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
 * Count users recursivly in a tier
 -----
 *
 */

var countUsersInTierTree = function (req, res) {

  var tier = req.body;

  countTotalUsersRecursively(tier, function (err, results) {
    if (err) {
      log.error("req", err);
      return res.json(500, "Error");
    }

    if (!results) {
      return res.json(200, []);
    }
    return res.json(200, tier);
  });
};



/**
 * Remove all Tiers in an array
 -----
 *
 */


var removeAllTiers = function (allTiers, done) {

  if (allTiers && allTiers[0]) {
    async.map(allTiers, function (tier, callback) {
      //---- Remove all of the tiers decendents
      Tier.remove({
        _id: tier._id
      }, function (err, result) {
        callback(err);
      });
    }, function (err, results) {
      done(err);
    });
  } else {
    done(null);
  }
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
        removeAllTiers(allTiers, function (err) {
          callback(err);
        });
      },
      function (callback) {
        Tier.pullChild(tier.parent, tier._id, function (err, results) {
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
 * getCompany
 *
 */
var getCompany = function (req, res) {

  var tierId = req.params.id || req.query.id;
  var tier = {
    _id: tierId
  };

  async.parallel([
    async.apply(Tier.getCompany, tierId),
    async.apply(countTotalUsersRecursively, tier),

  ], function (err, results) {
    if (err) {
      log.error("req", err);
      return res.json(500);
    }

    var company = results[0];
    company.totUsers = results[1];

    return res.json(200, company);

  });
};



/**
 * sync syncBambooDivisons
 -----
 *
 */

var syncBambooDivisons = function (companyId, division, done) {

  var newTier = new Tier({
    title: division,
    parent: companyId
  });

  async.waterfall([

    function (callback) {
      Tier.checkIfChildExists(companyId, division, function (err, results) {
        callback(err, results);
      });
    },
    function (found, callback) {

      if (!found[0]) {
        Tier.findParent(companyId, function (err, results) {
          if (results) {
            newTier._company = results._company;
            newTier.ancestors = results.ancestors;
            newTier._courses = results.courses;
            newTier.ancestors.push(newTier.parent);
          }
          callback(err, newTier);
        });
      } else {
        callback({
          exists: true
        }, found[0]);
      }
    },
    function (newTier, callback) {
      if (newTier) {
        newTier.save(function (err, results) {
          callback(err, results);
        });
      } else {
        callback(null, null);
      }
    },
    //---- Add the newly created child to parent
    function (tier, callback) {
      if (tier) {
        Tier.addChildToParent(tier.parent, tier._id, function (err, results) {
          callback(err, tier);
        });
      } else {
        callback(null, tier);
      }
    }

  ], function (err, results) {

    if (err && err.exists) { //----- Tier is already placed
      done(null, results);
    } else if (err) { //------- Error 
      done(err, results);
    } else { //-------- Tier created
      done(err, results);
    }

  });
};



/**
 * sortBambooHierarchy
 -----
* The bracks the tier creation process into divsion (top) Branch (bellow division)
* If there is no divion but a branch exists, make that the top
* If both a divion and branch dont exists, don;t fo anything
 *
 */


var bambooHierarchyToTiers = function (usersTier, companyId, user, done) {

  if (user.division !== undefined) {
    syncBambooDivisons(companyId, user.division, function (err, results) {
      usersTier = results._id;
      if (user.department) {
        syncBambooDivisons(results._id, user.department, function (err, results) {
          usersTier = results._id;
          done(err, usersTier);
        });
      } else {
        done(err, usersTier);
      }
    });
  } else if (user.division === undefined && user.department) {
    syncBambooDivisons(companyId, user.department, function (err, results) {
      done(err, results._id);
    });
  } else {
    done(null, usersTier);
  }
};



var addBambooUserToTiers = function (user, usersTier, rejectedUsers, invitedAuth, id, done) {

  var name = user.displayName;


  if (!user.workEmail) {
    rejectedUsers.push(name);
    done(null, null);
  } else {
    async.waterfall([

        function (done) {
          User.checkEmailExists(user.workEmail, function (err, results) {
            done(err, results);
          });
        },
        function (found, done) {

          if (!found) {

            var newUser = new User({
              isBeta: true,
              bamboohrId: id,
              name: name,
              _tier: usersTier,
              emails: [user.workEmail],
              avatarUrl: user.photoUrl,
              auth: invitedAuth
            });

            newUser.save(function (err, results) {
              if (err) {
                rejectedUsers.push(name);
              } else {
                //---- Invite newly created user via email
                var htmlTxt = "<p>You have been invited to start taking training courses</p>";
                htmlTxt += "<a href='https://" + baseUrl + "/invited/" + results._id + "'>Click to Register</a>";

                Email.sendMail("You have been invited to join your company's knowledge-sharing platform.", htmlTxt, results.emails[0], "toPerson", function (err, results) {

                });
              }
              done(err, null);
            });
          } else {
            //---- Always update to the latest tier
            User.updateBamboo(found._id, usersTier, user, name, function (err, results) {
              done(err, results);
            });
          }
        }
      ],
      function (err, results) {
        done(err, results);
      });
  }
};




/**
 * sync BambooHR
 -----
 *
 */


var syncBambooHR = function (req, res) {

  var companyId = req.body._company;
  var apikey = req.body.bamboo.apikey;
  var subdomain = req.body.bamboo.subdomain;
  var invitedAuth = req.body.auth;

  var rejectedUsers = [];

  User.getBambooEmployees(apikey, subdomain, function (err, employees) {


    if (err) {
      return res.json(404, "Incorrect Key or subdomain");
    }

    async.mapSeries(employees, function (employee, done) {

      var user = employee.fields;
      var usersTier = companyId;

      async.waterfall([

        function (done) {
          bambooHierarchyToTiers(usersTier, companyId, user, function (err, results) {
            usersTier = results;
            done(err, results);
          });
        },
        function (results, done) {
          //---- By default workEmail is the only fields, if they do not have a work Email ping tthe api directly on the user to get bestEmail
          if (!user.workEmail) {

            User.getBambooEmployee(apikey, subdomain, employee.id, function (err, results) {
              if (results && results.fields && results.fields.bestEmail) {
                user.workEmail = results.fields.bestEmail;
              }
              done(err, results);
            });
          } else {
            done(null, results);
          }
        },

        function (results, done) {
          addBambooUserToTiers(user, usersTier, rejectedUsers, invitedAuth, employee.id, function (err, results) {
            done(err, results);
          });
        }
      ], function (err, results) {
        done(err, results);
      });

    }, function (err, results) {

      if (err) {
        log.error("req", err);
        return res.json(500, "Error");
      }
      return res.json(200, {
        rejected: rejectedUsers
      });
    });
  });
};


/**
### Exports
 -----
 *
 */

module.exports = {
  updateLeaderboard: updateLeaderboard,
  changeWhiteLabel: changeWhiteLabel,
  searchTiers: searchTiers,
  find: find,
  update: update,
  createCompany: createCompany,
  addCourseToTier: addCourseToTier,
  removeCourseFromTiers: removeCourseFromTiers,
  add: add,
  listChildrenAndCountUsers: listChildrenAndCountUsers,
  countUsersInTierTree: countUsersInTierTree,
  remove: remove,
  distributeCourseToTiers: distributeCourseToTiers,
  getCompany: getCompany,
  syncBambooHR: syncBambooHR
};
