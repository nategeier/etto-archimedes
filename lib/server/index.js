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
app.put("/course/:id?", controllers.Course.update);
app.del("/course/:id", controllers.Course.destroy);
app.post("/course/destroy", controllers.Course.destroy);

app.get("/coursemeta/:id?", controllers.CourseMeta.find);
app.put("/coursemeta/:id?", controllers.CourseMeta.update);

app.post("/course/listTiersCourses", controllers.Course.listTiersCourses);

//--- Social auth and sessions

app.get("/auth/logout", controllers.Auth.logout);
app.get("/auth/get_session", controllers.Auth.getSession);
app.post("/auth/update_session", controllers.Auth.updateSession);

app.post("/auth/local", controllers.Auth.local);

app.get("/auth/github", controllers.Auth.github);
app.get("/auth/github/callback", controllers.Auth.githubCallback);

app.get("/auth/facebook", controllers.Auth.facebook);
app.get("/auth/facebook/callback", controllers.Auth.facebookCallback);

app.get("/auth/google", controllers.Auth.google);
app.get("/auth/google/callback", controllers.Auth.googleCallback);

//---- User
app.get("/user/listUsersInTier/:id", controllers.User.listUsersInTier);
app.post("/user/invite_user", controllers.User.inviteUser);
app.post("/user/update_users_tier", controllers.User.updateUsersTier);
app.post("/user/list_users_created_courses", controllers.User.listUsersCreatedCourses);
app.post("/user/destroy", controllers.User.destroy);
app.get("/user/fullDetails/:id", controllers.User.fullDetails);
app.post("/user/update", controllers.User.update);

///-------Tier
app.post("/tier/add", controllers.Tier.add);
app.post("/tier/remove", controllers.Tier.remove);
app.post("/tier/list_children_and_count_users", controllers.Tier.listChildrenAndCountUsers);
app.get("/tier/:id?", controllers.Tier.find);
app.post("/tier/update", controllers.Tier.update);
app.post("/tier/createCompany", controllers.Tier.createCompany);

//----- Store
app.post("/store/purchase", controllers.Store.purchase);
app.post("/store/find", controllers.Store.find);

//------ Records
app.post("/record/countCoursesRecordsInTier", controllers.Record.countCoursesRecordsInTier);

app.post("/record/completed", controllers.Record.completed);

module.exports = app;
