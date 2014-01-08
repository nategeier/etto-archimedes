var mongoose = require("mongoose"),
  Schema = mongoose.Schema;

/**
 * UserSchema
 *
 */
var UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  username: String,
  provider: String,
  enabled: Boolean,
  avatar_url: String,
  created: {
    type: Date,
    default: Date.now
  },
  _createdCourses: [{
    type: Schema.ObjectId,
    ref: "Course_meta_data"
  }],
  _needToTakeCourses: [{
    type: Schema.ObjectId,
    ref: "Course_meta_data"
  }],
  hashed_password: String,
  meta: {
    votes: Number,
    favs: Number
  },
  salt: String
});

module.exports = mongoose.model("User", UserSchema);
