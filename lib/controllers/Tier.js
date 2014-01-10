
"use strict";

var log = require("npmlog");

var User = require("../models/User")
  , async = require('async')
  , Tier = require("../models/Tier");


var search = function (req, res) {
  Tier.find({$or: [{_id: id}, {title: title}]}, function (err, results){
   return res.json(200, results);
  });
};


var find = function (req, res) {

  var query = {};
  var id = req.params.id || req.query.id;
  if (id) {
    query = {
      "_id": id
    };
  }


  Tier.find(query, function (err, tier){

    if (tier && tier.length === 0 && id) {
      return res.json(404, "Not Found");
    }
    // If searching by ID return the bare object
    if (id) {
      return res.json(200, tier[0]);
    }
    // Otherwise return the array of found objects
    return res.json(200, tier);


  });
};


var list = function (req, res) {
  Tier.find(function (err, results){
    return res.json(200, results);
  });
};

/**
* Add a tier post whole body
```
var TierSchema = new mongoose.Schema({
  title : String,
  parent : Schema.ObjectId,
  totUsers : Number,
  _children : [{ type: Schema.ObjectId, ref: 'Tier'}],
  ancestors : [{ type: Schema.ObjectId, ref: 'Tier'}],
  _users : [{ type: Schema.ObjectId, ref: 'User'}],
  _courses : [{ type: Schema.ObjectId, ref: 'CourseMeta'}]
});


```
*
*/

var add = function (req, res) {


  var new_tier = new Tier(req.body);


  async.waterfall([
    function(callback){

      //---  Add parents ancestors to the new tier
      if(new_tier.parent){
        Tier.findParent(new_tier.parent, function(err, results){
          if(results && results[0]){
            new_tier.ancestors = results[0].ancestors;
            new_tier.ancestors.push(new_tier.parent);
          }
          callback(err, new_tier);
        })

      }else{
        callback(null, new_tier);
      }
    },
    function (new_tier, callback){
      new_tier.save(function(err, results){
        callback(err, results);
      });
    },
    //---- Add the newly created child to parent
    function (tier, callback){

      if(new_tier.parent){
        Tier.addChildToParent(tier.parent, tier._id, function(err, results){
          callback(err, tier);
        })
      }else{
        callback(null, tier);
      }
    }
  ], 
  function(err, results){
    if(err){
      return res.json(500, 'Error');
    }else{
      return res.json(200, results);
    }
    
  })
};

/**
 * List all children of a tier and count users in each
 -----
 *
 */


var list_children_and_count_users = function (req, res) {

  var teirID = req.body._id;

  async.waterfall([
    function(callback){
      if(teirID){
        Tier.listChildrenTiers(teirID, function(err, children){
          callback(err, children)
        });
      }else{
        callback('Tier is null')
      }
    },
    function(children, callback){
      //----- Check if the level has children
      if(children && children[0]){
        async.map(children, function(tier, callback){
          var totalUsers = 0;

          async.waterfall([

            //----- Count top tier users
            function(callback){
              User.countUsersInTier(tier._id, function(err, result){
                totalUsers = Number(result);
                callback(err)
              });
            },
            function(callback){
              Tier.descendants(tier._id, function(err, results){
                callback(err, results)
              });
            },
            function(allTiers, callback){
              async.map(allTiers, function(tier, callback){

                User.countUsersInTier(tier._id, function(err, result){
                  totalUsers += Number(result);
                  callback(null, null);
                })
              }, function(err, results){

                 callback(null, null)
              });
            }
          ], 
          function (err, result){

            //tier.totUsers = totalUsers;
            callback(err, totalUsers)
          })
        }, function(err, results){
            callback(null, children);
        });
      } else {
        callback(null, null);
      }
    }
  ],
    function(err, results){
      if (err) {
        log.error("req", err);
        return res.json(500, "Error");
      }else if (!results){
        return res.json(200, []);
      } else {
        return res.json(200, results);
      }
      
    })
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
    function(callback){
      Tier.descendants(tier._id, function(err, results){
        callback(err, results)
      });
    },
    function(allTiers, callback){

      if(allTiers && allTiers[0]){
        async.map(allTiers, function(tier, callback){
        //---- Remove all of the riers decendents
          Tier.remove({ _id:tier._id }, function(err, result){
            callback(null, null);
          })
        }, function(err, results){
           callback(null)
        });

      }else{
        callback(null)
      }
    },
    function(callback){
      //---- Remove tier called
      Tier.findOneAndUpdate({ _id:tier.parent }, {$pull : { _children: tier._id}}, function(err, result){
        callback(err);
      })
    }, 
    function(callback){
      //---- Remove tier called
      Tier.remove({ _id:tier._id }, function(err, result){
        callback(err, result);
      })
    }], 
    function (err, result){

      if(err){
        log.error("req", err);
        return res.json(500);
      }

      if(result == 1){
        return res.json(200);
      }else{
        return res.json(404);
      }

    })
};


/**
### Exports
 -----
 *
 */



module.exports = {
  
  search: search,
  find: find,
  add: add,
  list: list,
  list_children_and_count_users: list_children_and_count_users,
  remove: remove
};
