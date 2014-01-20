"use strict";

/**
 * Configures and starts the server.
 *
 * @module      server/index
 */
var express = require("express"),
  RedisStore = require("connect-redis")(express),
  log = require("./log"),
  config = require("./config");

require("../db");
require("../models");

var controllers = require("../controllers");
var addPassport = require("../passport");

var app = express();

app.configure(function () {
  app.use(express.logger("dev"));
  app.use(express.cookieParser());
  app.use(express.urlencoded());
  app.use(express.json());
  app.use(express.methodOverride());
  app.use(express.session({
    store: new RedisStore(),
    secret: config.get("session:secret")
  }));
  addPassport(app, controllers.Auth);
});

app.listen(config.get("port"), function () {
  log.info("etto", "Coursetto is all ears on port %d", config.get("port"));
});

app.get("/course/:id?", controllers.Course.find);
app.post("/course", controllers.Course.create);
app.put("/course/:id", controllers.Course.update);
app.del("/course/:id", controllers.Course.destroy);
app.post("/course/destroy", controllers.Course.destroy);

app.get("/coursemeta/:id?", controllers.CourseMeta.find);
app.put("/coursemeta/:id", controllers.CourseMeta.update);

//--- Social auth and sessions

app.get("/auth/logout", controllers.Auth.logout);
app.get("/auth/get_session", controllers.Auth.get_session);
app.post("/auth/update_session", controllers.Auth.update_session);

app.get("/auth/github", controllers.Auth.github);
app.get("/auth/github/callback", controllers.Auth.github_callback);

app.get("/auth/facebook", controllers.Auth.facebook);
app.get("/auth/facebook/callback", controllers.Auth.facebook_callback);

app.get("/auth/google", controllers.Auth.google);
app.get("/auth/google/callback", controllers.Auth.google_callback);

//---- User
app.post("/user/invite_user", controllers.User.invite_user);
app.post("/user/update_users_tier", controllers.User.update_users_tier);
app.post("/user/list_users_created_courses", controllers.User.list_users_created_courses);

///-------Tier
app.post("/tier/add", controllers.Tier.add);

app.post("/tier/remove", controllers.Tier.remove);

app.post("/tier/list_children_and_count_users", controllers.Tier.list_children_and_count_users);
//app.get("/tier", controllers.Tier.list);
app.get("/tier/:id?", controllers.Tier.find);

module.exports = app;
