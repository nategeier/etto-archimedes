"use strict";

/**
 * AuthController
 *  tets
 * @module    :: Controller
 * @description :: Contains logic for handling requests.
 */

var passport = require("passport");
var User = require("../models/User");
var config = require("../server/config");

var AuthController = {

  logout: function (req, res) {
    req.logout();
    delete req.session.user;
    return res.json(201);
  },

  getSession: function (req, res) {

    return res.json(200, req.session.user);
  },

  updateSession: function (req, res) {

    var id = req.body._id;

    User.findOne({
      _id: id
    }).populate("_tier").exec(function (err, results) {
      req.session.user = results;
      return res.json(200, results);
    });
  },

  local: function (req, res) {
    passport.authenticate("local", function (err, user, info) {

      if (!user) {
        return res.json(200, info);
      }

      req.logIn(user, function (err) {
        if (err) {
          return res.json(200, info);
        }

        req.session.user = user;
        return res.json(200, user);
      });
    })(req, res);
  },

  github: function (req, res) {

    req.session.inviteId = req.query.userId;

    passport.authenticate("github", {
        failureRedirect: "/"
      },
      function (err, user) {

        req.logIn(user, function (err) {

          if (err) {
            res.redirect("500");
            return;
          }
          res.redirect(config.get("appurl") + "/etto");
          return;
        });
      })(req, res);
  },

  githubCallback: function (req, res) {

    passport.authenticate("github",

      function (err, user) {
        req.session.user = user;
        res.redirect(config.get("appurl") + "/etto");
      })(req, res);
  },

  facebook: function (req, res) {
    passport.authenticate("facebook", {
        failureRedirect: "/",
        scope: ["email"]
      },
      function (err, user) {
        req.logIn(user, function (err) {
          if (err) {
            res.view("500");
            return;
          }
          res.redirect(config.get("appurl") + "/etto");
          return;
        });
      })(req, res);
  },

  facebookCallback: function (req, res) {
    passport.authenticate("facebook",
      function (err, user) {
        req.session.user = user;
        res.redirect(config.get("appurl") + "/etto");
      })(req, res);
  },

  google: function (req, res) {
    passport.authenticate("google", {
        failureRedirect: "/",
        scope: ["https://www.googleapis.com/auth/plus.login", "https://www.googleapis.com/auth/userinfo.profile", "https://www.googleapis.com/auth/userinfo.email"]
      },
      function (err, user) {
        req.logIn(user, function (err) {
          if (err) {
            res.view("500");
            return;
          }
          res.redirect(config.get("appurl") + "/etto");
          return;
        });
      })(req, res);
  },

  googleCallback: function (req, res) {


    passport.authenticate("google",

      function (err, user) {
        req.session.user = user;
        res.redirect(config.get("appurl") + "/etto");
      })(req, res);

  },

  forcedotcom: function (req, res) {
    passport.authenticate("forcedotcom", {
        failureRedirect: "/",
        scope: ["id", "chatter_api"]
      },
      function (err, user) {
        req.logIn(user, function (err) {
          if (err) {
            res.view("500");
            return;
          }
          res.redirect(config.get("appurl") + "/etto");
          return;
        });
      })(req, res);
  },

  forcedotcomCallback: function (req, res, next) {
    passport.authenticate("forcedotcom",

      function (err, user) {
        req.session.user = user;
        res.redirect(config.get("appurl") + "/etto");
      })(req, res, next);
  },

  linkedin: function (req, res, next) {
    passport.authenticate("linkedin", {
        failureRedirect: "/",
        profileFields: ["id", "first-name", "last-name", "email-address", "picture-urls::(original)"]
      },
      function (err, user) {
        req.logIn(user, function (err) {
          if (err) {
            res.view("500");
            return;
          }
          res.redirect(config.get("appurl") + "/etto");
          return;
        });
      })(req, res, next);
  },

  linkedinCallback: function (req, res, next) {
    passport.authenticate("linkedin",

      function (err, user) {
        req.session.user = user;
        res.redirect(config.get("appurl") + "/etto");
      })(req, res, next);

  }
};

module.exports = AuthController;
