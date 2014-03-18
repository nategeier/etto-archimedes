"use strict";

var log = require("npmlog");

var async = require("async"),
  mongoose = require("mongoose"),
  User = require("../models/User"),
  Tier = require("../models/Tier"),
  AWS = require("aws-sdk"),
  s3 = new AWS.S3({
    computeChecksums: true
  });

/**
 * Find all tiers
 -----
 *
 */

var s3Url = function (req, res) {
  var params = {
    Bucket: "etto-archimedes-test",
    Key: "long"
  };

  s3.getSignedUrl("putObject", params, function (err, url) {
    console.log("The URL is", err, url);
    var result = {
      url: url
    };

    return res.json(200, result);
  });
};

var uploader = function (req, res) {

  console.log("file ", req.files);

  console.log("body ", req.body);

  var file = req.files.file;

  /**
   * Don't hard-code your credentials!
   * Export the following environment variables instead:
   *
   * export AWS_ACCESS_KEY_ID='AKID'
   * export AWS_SECRET_ACCESS_KEY='SECRET'
   */

  // Set your region for future requests.
  AWS.config.region = "us-west-2";

  // Create a bucket using bound parameters and put something in it.
  // Make sure to change the bucket name from "myBucket" to something unique.
  var s3bucket = new AWS.S3({
    params: {
      Bucket: "etto"
    }
  });

  s3bucket.createBucket(function () {
    var data = {
      Key: "rick",
      Body: file
    };
    s3bucket.putObject(data, function (err, data) {
      if (err) {
        console.log("Error uploading data: ", err);
      } else {
        console.log("Successfully uploaded data to myBucket/myKey");
      }
    });
  });

  return res.json(201);
};

/**
### Exports
 -----
 *
 */

module.exports = {
  s3Url: s3Url,
  uploader: uploader
};
