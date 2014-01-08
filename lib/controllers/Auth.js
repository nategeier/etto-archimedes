"use strict";

/**
 * AuthController
 *  tets
 * @module    :: Controller
 * @description :: Contains logic for handling requests.
 */

var passport = require("passport");

var AuthController = {

  logout: function (req, res) {
    req.logout();
    res.redirect("/");
  },

  get_session: function (req, res) {
    res.send(req.user);
  },

  "local": function (req, res) {
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

  "local/callback": function (req, res) {
    passport.authenticate("local",
      function (req, res) {
        res.redirect("/etto");
      })(req, res);
  },

  "github": function (req, res) {
    passport.authenticate("github", {
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

  "github/callback": function (req, res) {
    passport.authenticate("github",
      function (req, res) {
        res.redirect("/etto");
      })(req, res);
  },

  "facebook": function (req, res) {
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

  "facebook/callback": function (req, res) {
    passport.authenticate("facebook",
      function (req, res) {
        res.redirect("/etto");
      })(req, res);
  },

  "google": function (req, res) {
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

  "google/callback": function (req, res) {
    passport.authenticate("google",
      function (req, res) {
        res.redirect("/etto");
      })(req, res);
  }

};

module.exports = AuthController;
