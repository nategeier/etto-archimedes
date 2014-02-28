"use strict";

var mongoose = require("mongoose"),
  Schema = mongoose.Schema;

/**
 * RecordSchema
 *


var CreditSchema = new mongoose.Schema({
  _company: {
    type: Schema.ObjectId,
    ref: "Tier"
  },
  credits: {
    type: Number,
    default: 0
  },
  purchased: [{
    purchaser: {
      type: Schema.ObjectId,
      ref: "User"
    },
    credits: Number,
    amount: Number,
    date: {
      type: Date,
      default: Date.now
    },
    desc: String,
    _subscription: {
      type: Schema.ObjectId,
      ref: "Subscription"
    },
    _course: {
      type: Schema.ObjectId,
      ref: "Course"
    }
  }],
  used: [{
    _user: {
      type: Schema.ObjectId,
      ref: "User"
    },
    _company: {
      type: Schema.ObjectId,
      ref: "Tier"
    },
    _course: {
      type: Schema.ObjectId,
      ref: "Course"
    },
    date: {
      type: Date,
      default: Date.now
    }
  }],
  received: [{
    paid: Date,
    createdAt: {
      type: Date,
      default: Date.now
    },
    amount: Number,
    _course: {
      type: Schema.ObjectId,
      ref: "Course"
    },
    _user: {
      type: Schema.ObjectId,
      ref: "User"
    },
    _company: {
      type: Schema.ObjectId,
      ref: "User"
    }
  }]
});

var Credit = mongoose.model("Credit", CreditSchema);

Credit.checkSufficientFunds = function (companyId, amountNeeded, done) {

  if (typeof companyId === "string") {
    companyId = new mongoose.Types.ObjectId(companyId);
  }

  Credit.findOne({
    "_company": companyId
  }, "credits", function (err, results) {
    if (err) {
      done(err, false);
    }

    if (results && results.credits > amountNeeded) {
      done(err, true);
    } else {
      done(err, false);
    }

  });
};

Credit.findCredit = function (id, done) {

  if (typeof id === "string") {
    id = new mongoose.Types.ObjectId(id);
  }

  Credit.findOne({
    "_company": id
  }).populate("_company purchased.purchaser purchased._course").exec(function (err, results) {
    done(err, results);
  });
};

Credit.useCredits = function (companyId, userId, courseId, amount, done) {

  if (typeof companyId === "string") {
    companyId = new mongoose.Types.ObjectId(companyId);
  }

  var query = {
    "_company": companyId
  };

  var update = {
    "$inc": {
      "credits": Number(-amount)
    },
    "$addToSet": {
      "used": {
        "_user": userId,
        "_company": companyId,
        "_course": courseId
      }
    }
  };

  Credit.update(query, update, {
    upsert: true
  }, function (err, results) {
    done(err, results);
  });
};

Credit.giveCredits = function (companyId, userId, courseId, amount, done) {

  if (typeof companyId === "string") {
    companyId = new mongoose.Types.ObjectId(companyId);
  }

  var query = {
    "_company": companyId
  };

  var update = {
    "$set": {
      "_company": companyId
    },
    "$inc": {
      "credits": amount
    },
    "$addToSet": {
      "received": {
        "_course": courseId,
        "_user": userId,
        "_company": companyId
      }
    }
  };

  Credit.update(query, update, {
    upsert: true
  }, function (err, user) {
    done(err, user);
  });
};

Credit.updateCredit = function (order, courseId, subscriptionId, desc, done) {

  var companyId = order.user._tier._company;

  if (typeof companyId === "string") {
    companyId = new mongoose.Types.ObjectId(companyId);
  }

  if (typeof subscriptionId === "string") {
    subscriptionId = new mongoose.Types.ObjectId(subscriptionId);
  }

  if (typeof courseId === "string") {
    courseId = new mongoose.Types.ObjectId(courseId);
  }

  var updateQuery = {

    "$set": {
      "_company": companyId
    },
    "$inc": {
      "credits": order.addedCredits
    },
    "$addToSet": {
      "purchased": {
        "purchaser": order.user._id,
        "credits": order.addedCredits,
        "amount": order.addedCredits,
        "_course": courseId,
        "_subscription": subscriptionId,
        "desc": desc
      }
    }
  };
  Credit.update({
    "_company": companyId
  }, updateQuery, {
    upsert: true
  }, function (err, numberAffected, rawResponse) {
    done(err);
  });
};

module.exports = Credit;

 */
