"use strict";

/**
 * AuthController
 *  tets
 * @module    :: Controller
 * @description :: Contains logic for handling requests.
 */

var passport = require("passport");
var User = require("../models/User");

var AuthController = {

  logout: function (req, res) {
    req.logout();
    res.redirect("/");
  },

  get_session: function (req, res) {
    return res.json(200, req.session.user);
  },

  update_session: function (req, res) {

    User.findOne({
      email: req.body.email
    }).populate("_tier").exec(function (err, results) {
      req.session.user = results;
      return res.json(200, results);
    });

  },

  local: function (req, res) {
    passport.authenticate("local", {
        failureRedirect: "/login"
      },
      function (err, user) {
        req.logIn(user, function (err) {
          if (err) {
            res.view("500");
            return;
          }

          res.redirect("/etto");
          return;
        });
      })(req, res);
  },

  local_callback: function (req, res) {
    passport.authenticate("local",
      function (req, res) {
        res.redirect("/etto");
      })(req, res);
  },

  github: function (req, res) {
    passport.authenticate("github", {
        failureRedirect: "/login"
      },
      function (err, user) {
        req.logIn(user, function (err) {
          if (err) {
            res.redirect("500");
            return;
          }
          res.redirect("/etto");
          return;
        });
      })(req, res);
  },

  github_callback: function (req, res) {
    passport.authenticate("github",
      function (err, user) {
        req.session.user = user;
        res.redirect("/etto");
      })(req, res);
  },

  facebook: function (req, res) {
    passport.authenticate("facebook", {
        failureRedirect: "/login",
        scope: ["email"]
      },
      function (err, user) {
        req.logIn(user, function (err) {
          if (err) {
            res.view("500");
            return;
          }
          res.redirect("/etto");
          return;
        });
      })(req, res);
  },

  facebook_callback: function (req, res) {
    passport.authenticate("facebook",
      function (err, user) {
        req.session.user = user;
        res.redirect("/etto");
      })(req, res);
  },

  google: function (req, res) {
    passport.authenticate("google", {
        failureRedirect: "/login",
        scope: ["https://www.googleapis.com/auth/plus.login", "https://www.googleapis.com/auth/userinfo.profile", "https://www.googleapis.com/auth/userinfo.email"]
      },
      function (err, user) {
        req.logIn(user, function (err) {
          if (err) {
            res.view("500");
            return;
          }
          res.redirect("/etto");
          return;
        });
      })(req, res);
  },

  google_callback: function (req, res) {
    passport.authenticate("google",
      function (err, user) {
        req.session.user = user;
        res.redirect("/etto");
      })(req, res);
  }

};

module.exports = AuthController;
