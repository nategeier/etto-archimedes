"use strict";

var passport = require("passport"),
  GitHubStrategy = require("passport-github").Strategy,
  FacebookStrategy = require("passport-facebook").Strategy,
  GoogleStrategy = require("passport-google-oauth").OAuth2Strategy,
  LocalStrategy = require("passport-local").Strategy,
  async = require("async"),
  User = require("../models/User"),
  Tier = require("../models/Tier");

var verifyHandler = function (token, tokenSecret, profile, done) {
  var avatarURL;

  process.nextTick(function () {
    async.waterfall([

      function (callback) {
        User.findOne({
          email: profile._json.email
        }, function (err, result) {
          callback(err, result);
        });
      },
      function (user, callback) {
        var newUser;
        if (user) {
          callback(null, user);
        } else {
          newUser = new User({
            name: profile.displayName,
            email: profile._json.email,
            provider: profile.provider,
            enabled: true,
            meta: {
              votes: 1,
              favs: 1
            }
          });

          switch (profile.provider) {
          case "google":
            newUser.avatarURL = profile._json.picture;
            break;
          case "github":
            newUser.avatarURL = profile._json.avatar_url;
            break;
          case "facebook":
            avatarURL = "none";
            break;
          default:
          }

          newUser.save(function (err, user) {
            callback(err, user);
          });
        }
      },
      function (user, callback) {
        User.findOne({
          email: profile._json.email
        }).populate("_tier").exec(function (err, results) {
          //console.log(results);
          callback(err, results);
        });
      }
    ], function (err, user) {
      return done(err, user);
    });
  });
};

passport.serializeUser(function (user, done) {
  done(null, user.email);
});

passport.deserializeUser(function (email, done) {
  User.findOne({
    email: email
  }, function (err, user) {
    done(err, user);
  });
});

var addPassport = function (app, conf, controllers) {
  var protocol = "http://";
  var baseUrl = conf.get("baseurl");
  var apiVer = conf.get("apiver");

  passport.use(new LocalStrategy(verifyHandler));

  var githubConf = conf.get("passport:github");
  githubConf.callbackURL = protocol + [baseUrl, apiVer, githubConf.callbackURL].join("/");
  passport.use(new GitHubStrategy(githubConf, verifyHandler));

  var facebookConf = conf.get("passport:facebook");
  facebookConf.callbackURL = protocol + [baseUrl, apiVer, facebookConf.callbackURL].join("/");
  passport.use(new FacebookStrategy(facebookConf, verifyHandler));

  var googleConf = conf.get("passport:google");
  googleConf.callbackURL = protocol + [baseUrl, apiVer, googleConf.callbackURL].join("/");
  passport.use(new GoogleStrategy(googleConf, verifyHandler));

  app.use(passport.initialize());
  app.use(passport.session());

  // Route to controllers
  Object.keys(controllers).forEach(function (controller) {
    app.get(["/auth/", controller].join(""), controllers[controller]);
  });
};

module.exports = addPassport;
