"use strict";

var passport = require("passport"),
  GitHubStrategy = require("passport-github").Strategy,
  ForceDotComStrategy = require("passport-forcedotcom").Strategy,
  FacebookStrategy = require("passport-facebook").Strategy,
  GoogleStrategy = require("passport-google-oauth").OAuth2Strategy,
  LinkedInStrategy = require("passport-linkedin").Strategy,
  LocalStrategy = require("passport-local").Strategy,
  async = require("async"),
  bcrypt = require("bcrypt"),
  User = require("../models/User"),
  Email = require("../services/email"),
  config = require("../server/config");

var verifyHandler = function (req, token, tokenSecret, profile, done) {

  var inviteId = req.session.inviteId;

  var newUser = {};

  switch (profile.provider) {
  case "google":
    newUser.avatarUrl = profile._json.picture;
    break;
  case "github":
    newUser.avatarUrl = profile._json.avatar_url;
    break;
  case "facebook":
    newUser.avatarUrl = "https://graph.facebook.com/" + profile.username + "/picture?type=large";
    break;
  case "forcedotcom":
    newUser.avatarUrl = profile._raw.photos.picture;
    newUser.email = profile._raw.email;
    break;
  default:

  }

  if (!newUser.email) {
    newUser.email = profile._json.email;
  }


  process.nextTick(function () {
    async.waterfall([

      function (callback) {


        User.findOne({
          $or: [{
            emails: {
              $in: [new RegExp(newUser.email, "i")]
            }
          }, {
            _id: inviteId
          }]
        }).populate("_tier").exec(function (err, user) {
          callback(err, user);
        });
      },
      function (user, callback) {

        //console.log(user)
        //--------------- User used local auth first time, now using social, update new info
        if (user && !user.avatarUrl) {

          var set = {
            $set: {
              avatarUrl: newUser.avatarUrl
            }
          };

          User.findOneAndUpdate({
            emails: [newUser.email]
          }, set, function (err, results) {

            user.avatarUrl = newUser.avatarUrl;
            callback(null, user);
          });

          //------------ User found log them in
        } else if (user) {
          callback(null, user);
        } else { //----- User not found, save them

          var saveUser = new User({
            "name": profile.displayName,
            "avatarUrl": newUser.avatarUrl,
            "provider": profile.provider,
            "emails": [newUser.email],
            "isBeta": true,
            "enabled": true,
            "meta": {
              "votes": 1,
              "favs": 1
            }
          });

          saveUser.save(function (err, results) {

            Email.justRegisteredEmail(results, function (err, results) {
              //---- TODO finished sending email, the user gets redirected.
              //----- Need to handle email varification better
            });
            callback(null, results);

          });
        }
      }
    ], function (err, user) {
      return done(err, user);
    });
  });
};

passport.serializeUser(function (user, done) {
  done(null, user.emails);
});

passport.deserializeUser(function (email, done) {
  User.findOne({
    emails: {
      $in: [new RegExp(email, "i")]
    }
  }, function (err, user) {
    done(err, user);
  });
});

var addPassport = function (app, controllers) {

  var protocol = config.get("protocol");
  var baseUrl = config.get("baseurl");


  if (baseUrl !== "api.coursetto.com") {
    baseUrl = baseUrl + "/api/v1";
  }

  passport.use(new LocalStrategy(function (username, password, done) {

    var userfield = {
      $or: [{
        username: username
      }, {
        emails: {
          $in: [new RegExp(username, "i")]
        }
      }]
    };

    var isEnabled = {
      enabled: true
    };

    User.findOne({
      $and: [userfield, isEnabled]
    }).populate("_tier").exec(function (err, user) {

      if (err) {
        return done(err);
      }
      if (!user) {
        return done(null, false, {
          message: "Your user information is incorrect or the account has been disabled."
        });
      }

      bcrypt.compare(password, user.hash, function (err, results) {

        if (results === true) {
          return done(null, user);


        } else {
          return done(null, false, {
            message: "Incorrect password."
          });
        }
      });

    });
  }));


  var forcedotcomConf = config.get("passport:forcedotcom");
  forcedotcomConf.callbackURL = protocol + [baseUrl, "auth/forcedotcom/callback"].join("/");
  passport.use(new ForceDotComStrategy(forcedotcomConf, verifyHandler));


  var githubConf = config.get("passport:github");
  githubConf.callbackURL = protocol + [baseUrl, "auth/github/callback"].join("/");
  passport.use(new GitHubStrategy(githubConf, verifyHandler));

  var facebookConf = config.get("passport:facebook");
  facebookConf.callbackURL = protocol + [baseUrl, "auth/facebook/callback"].join("/");
  passport.use(new FacebookStrategy(facebookConf, verifyHandler));

  var googleConf = config.get("passport:google");
  googleConf.callbackURL = protocol + [baseUrl, "auth/google/callback"].join("/");
  passport.use(new GoogleStrategy(googleConf, verifyHandler));

  app.use(passport.initialize());
  app.use(passport.session());

  // Route to controllers
  Object.keys(controllers).forEach(function (controller) {
    //app.get(["/auth/", controller].join(""), controllers[controller]);
  });
};
module.exports = addPassport;
