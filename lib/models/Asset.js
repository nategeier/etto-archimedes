"use strict";

var mongoose = require("mongoose"),
  Schema = mongoose.Schema;

/**
 * AssetSchema
 */
var AssetSchema = new mongoose.Schema({
  _company: {
    type: Schema.ObjectId,
    ref: "Tier"
  },
  url: {
    type: String
  },
  s3: {
    type: Object
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
});

var Asset = mongoose.model("Asset", AssetSchema);

module.exports = Asset;
