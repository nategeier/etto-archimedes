"use strict";

var crypto = require("crypto");

var config = require("../server/config");
var log = require("../server/log");
var Asset = require("../models/Asset");

var getExpiryTime = function () {
  var _date = new Date();
  return "" + (_date.getFullYear()) + "-" + (_date.getMonth() + 1) + "-" +
    (_date.getDate() + 1) + "T" + (_date.getHours() + 3) + ":" + "00:00.000Z";
};

var createS3Policy = function (companyId, fileName, mimeType, callback) {
  // TODO: Add Company ID to key
  var s3Policy = {
    "expiration": getExpiryTime(),
    "conditions": [
      ["starts-with", "$key", "assets/" + companyId + "/"], {
        "bucket": config.get("aws:s3:bucket")
      }, {
        "acl": "public-read"
      },
      ["starts-with", "$Content-Type", mimeType], {
        "success_action_status": "201"
      }
    ]
  };

  // stringify and encode the policy
  var stringPolicy = JSON.stringify(s3Policy);
  var base64Policy = new Buffer(stringPolicy, "utf-8").toString("base64");

  // sign the base64 encoded policy
  var signature = crypto.createHmac("sha1", config.get("aws:s3:secretAccessKey"))
    .update(new Buffer(base64Policy, "utf-8")).digest("base64");

  // build the results object
  var s3Credentials = {
    s3Policy: base64Policy,
    s3Signature: signature,
    AWSAccessKeyId: config.get("aws:s3:accessKeyId"),
    key: ["assets", companyId, Math.round(Math.random() * 10000) + "--${filename}"].join("/"),
  };

  // send it back
  callback(s3Credentials);
};

var getS3Policy = function (req, res) {
  // TODO: Proper string escaping (in pupil, too) and verify req.session.user
  createS3Policy(req.session.user._tier._company, req.query.fileName, req.query.mimeType, function (creds, err) {
    if (!err) {
      return res.send(200, creds);
    } else {
      return res.send(500, err);
    }
  });
};

/**
 * Asset find controller
 *
 */
var find = function (req, res) {
  var query = {};

  var id = req.body._id || req.params.id || req.query.id;
  if (id) {
    query._id = id;
  } else {
    query._company = req.session.user._tier._company;
  }

  Asset.find(query, function (err, metadata) {
    if (err) {
      log.error("req", err);
      return res.json(500, "Error");
    }
    // If searching by ID found nothing return 404
    if (metadata && metadata.length === 0 && id) {
      return res.json(404, "Not Found");
    }
    // If searching by ID return the bare object
    if (id) {
      return res.json(200, metadata[0]);
    }
    // Otherwise return the array of found objects
    return res.json(200, metadata);
  });
};

/**
 * Asset create controller
 *
 */
var create = function (req, res) {
  // TODO: Validation
  var newAsset = new Asset(req.body);

  newAsset._company = req.session.user._tier._company;

  newAsset.save(function (err, course) {
    if (err) {
      log.error("req", err);
      return res.json(500, "Error");
    }
    return res.json(201, course);
  });
};

/**
 * Asset update controller
 *
 */
var update = function (req, res) {
  // TODO: Add tests for updates via req.body and req.query
  var query = {};
  var id = req.body._id || req.params.id || req.query.id;
  if (id) {
    query = {
      "_id": id
    };
  }

  // TODO: Validation and add tests to ensure validation
  // Drop any disallowed properties
  delete req.body._id;
  delete req.body.createdAt;
  // Set time of last update to now
  req.body.updatedAt = Date.now();
  Asset.findOneAndUpdate(query, req.body, function (err, metadata) {
    if (err) {
      log.error("req", err);
      return res.json(500, "Error");
    }
    if (metadata === null) {
      return res.json(404, "Not Found");
    }
    return res.json(200, metadata);
  });
};

/**
 * Asset destroy controller
 *
 */
var destroy = function (req, res) {
  Asset.findOneAndRemove({
    "_id": req.params.id || req.body.id
  }, function (err, metadata) {
    if (err) {
      log.error("req", err);
      return res.json(500, "Error");
    }
    if (metadata === null) {
      return res.json(404, "Not Found");
    }
    return res.json(204, null);
  });
};

/**
 * Exported Controllers
 */
module.exports = {
  find: find,
  create: create,
  update: update,
  destroy: destroy,
  getS3Policy: getS3Policy,
};
