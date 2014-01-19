var mongoose = require("mongoose"),
  Schema = mongoose.Schema;

/**
 * CourseSchema
 *
 */
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
  // Should be enum (live, private, testing, disabled)
  status: {
    type: String,
    default: "testing"
  },
  _creators: [{
    type: Schema.ObjectId,
    ref: "User"
  }],
  meta: {
    votes: {
      type: Number,
      default: 1
    },
    favs: {
      type: Number,
      default: 1
    },
    keywords: Array,
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

module.exports = Course;