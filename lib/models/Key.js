"use strict";

var mongoose = require("mongoose"),
  Schema = mongoose.Schema;

/**
 * AssetSchema
 */
var KeySchema = new mongoose.Schema({
  _company: {
    type: Schema.ObjectId,
    ref: "Tier",
    unique: true
  },
  bamboo: {
    apikey: String,
    subdomain: String
  }
});

var Key = mongoose.model("Key", KeySchema);


/**
 * updateBambooKey
 -----
 *
 */

Key.updateBambooKey = function (keys, done) {

  var companyId = keys._company;

  if (typeof companyId === "string") {
    companyId = new mongoose.Types.ObjectId(companyId);
  }


  Key.findOneAndUpdate({
    _id: companyId
  }, {
    $set: {
      _company: companyId,
      bamboo: keys.bamboo
    }
  }, {
    upsert: true
  }, function (err, results) {
    done(err, results);
  });
};


/**
 * updateBambooKey
 -----
 *
 */

Key.findBambooKey = function (companyId, done) {


  if (typeof companyId === "string") {
    companyId = new mongoose.Types.ObjectId(companyId);
  }

  Key.find({
    _id: companyId
  }, function (err, results) {
    done(err, results);
  });
};




module.exports = Key;
