"use strict";

var mongoose = require("mongoose");

/**
 * Helper to create documents for tests
 *
 * @param {String} collection The name of the collection to create documents in
 * @returns {Function} The final create function, which takes as parameters:
                       1) the document to create and
                       2) a callback that takes the created document as a parameter
 */
module.exports.createAndTestFrom = function (collection) {
  return function (doc, cb) {
    mongoose.connection.collections[collection]
      .insert(doc, function (err, docs) {
        cb(docs[0]);
      });
  };
};

/**
 * Helper to remove documents created in tests
 *
 * @param {String} collection The name of the collection to remove from
 * @returns {Function} The final remove function which takes the document to
 *                     remove as a parameter
 */
module.exports.removeFrom = function(collection) {
  return function (doc) {
    mongoose.connection.collections[collection]
      .remove({
        _id: doc._id
      }, function () {});
  };
};
