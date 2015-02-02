"use strict";

var mongoose = require("mongoose"),
  Schema = mongoose.Schema;

/**
 * CourseSchema
 *too
 */

//// testing, inactive, live, private

var CourseSchema = new mongoose.Schema({
  title: {
    type: String,
    default: ""
  },
  subtitle: {
    type: String,
    default: ""
  },
  description: {
    type: String,
    default: ""
  },
  price: {
    type: Number,
    default: 0
  },
  thumb: {
    type: String,
    default: "/images/courses/default/thumb.jpg"
  },
  status: {
    type: String,
    default: "testing"
  },
  _record: Object,
  disabled: {
    type: Boolean,
    default: false
  },
  _creator: {
    type: Schema.ObjectId,
    ref: "Tier"
  },
  dateLaunched: Date,
  meta: {
    votes: {
      type: Number,
      default: 1
    },
    favs: {
      type: Number,
      default: 1
    },
    keywords: String,
    averageTime: {
      type: Number,
      default: 0
    }
  },
  reviews: [{
    user: {
      type: Schema.ObjectId,
      ref: "User"
    },
    comment: String
  }],
  assets: [{
    type: Schema.ObjectId,
    ref: "Assets"
  }],
  blocks: [{
    type: {
      type: String,
    },
    data: {
      type: Object,
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
});

var Course = mongoose.model("Course", CourseSchema);

/**
 * getCeatedCourses
 -----
 *
 */

Course.getCeatedCourses = function (id, done) {

  if (typeof id === "string") {
    id = new mongoose.Types.ObjectId(id);
  }

  var query = {
    $and: [{
      _creator: id
    }, {
      disabled: false
    }]
  };

  Course.find(query, "price _creator thumb meta", function (err, course) {
    done(err, course);
  });
};



/**
 * change status
 -----
 *
 */

Course.updateStatus = function (id, status, done) {

  if (typeof id === "string") {
    id = new mongoose.Types.ObjectId(id);
  }

  var query = {
    _id: id
  };

  var update = {
    $set: {
      status: status
    }
  };

  Course.update(query, update, function (err, course) {
    done(err, course);
  });
};


/**
 * creator
 -----
 *
 */

Course.creator = function (id, done) {

  if (typeof id === "string") {
    id = new mongoose.Types.ObjectId(id);
  }
  var query = {
    _id: id
  };

  Course.find(query, "_creator thumb meta", function (err, course) {
    done(err, course);
  });
};

/**
 * courseTitle
 -----
 *
 */

Course.courseTitle = function (id, done) {

  if (typeof id === "string") {
    id = new mongoose.Types.ObjectId(id);
  }
  var query = {
    _id: id
  };

  Course.findOne(query, "price _creator thumb meta title subtitle", function (err, course) {
    done(err, course);
  });
};

/**
 * storeCourses
 -----
 *
 */

Course.storeCourses = function (done) {

  var query = {
    $and: [{

      status: "live"
    }, {
      disabled: false
    }]
  };

  Course.find(query, "price _creator title subtitle meta.keywords thumb", function (err, course) {
    done(err, course);
  });
};

/**
 * getPriceAndCreator
 -----
 *
 */

Course.getPriceAndCreator = function (id, done) {

  if (typeof id === "string") {
    id = new mongoose.Types.ObjectId(id);
  }

  var query = {
    _id: id
  };

  this.findOne(query, "price _creator thumb meta", function (err, course) {
    done(err, course);
  });
};
/**
 * list all created CompanyCourses
 -----
 *
 */

Course.listCompanyCreatedCourses = function (id, callback) {

  if (typeof id === "string") {
    id = new mongoose.Types.ObjectId(id);
  }

  Course.find({
      $and: [{
        _creator: id
      }, {
        disabled: false
      }]
    }, "title subtitle price thumb meta.keywords",
    function (err, results) {
      callback(err, results);
    });
};

/**
 * listCompanyCourses
 -----
 *
 */

Course.listCompanyCourses = function (id, callback) {

  if (typeof id === "string") {
    id = new mongoose.Types.ObjectId(id);
  }

  Course.find({
      $and: [{

        _creator: id
      }, {
        disabled: false
      }, {
        $or: [{

          status: "private"
        }, {
          status: "live"
        }]
      }]
    },
    "title subtitle price thumb meta",
    function (err, results) {
      callback(err, results);
    });
};

module.exports = Course;
