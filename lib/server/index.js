"use strict";

/**
 * Configures and starts the server.
 *
 * @module      server/index
 */
var express = require("express");
var MongoStore = require("connect-mongo")(express);
var log = require("./log");
var config = require("./config");
var cors = require("cors");

var db = require("../db");
require("../models");

var controllers = require("../controllers");
var addPassport = require("../passport");

var app = express();

app.configure(function () {
  if (config.get("logging") !== "silent") {
    app.use(express.logger("dev"));
  }
  app.use(express.cookieParser());
  app.use(express.urlencoded());
  app.use(express.json());
  app.use(express.methodOverride());
  app.use(express.session({
    store: new MongoStore({
      db: db.connection.db
    }),
    secret: config.get("session:secret")
  }));
  addPassport(app, controllers.Auth);
  // Setup CORS for  all routes defined past this call
  var corsOptions = {
    origin: "http://coursetto.com",
    credentials: true,
  };
  app.use(cors(corsOptions));
});

app.listen(config.get("port"), function () {
  log.info("etto", "Coursetto is all ears on port %d", config.get("port"));
});

//--- hit each page requring log in
function requiresLogin(req, res, next) {
  if (req.session.user) {
    next();
  } else {
    return res.json(401, req.path);
  }
}

//----- Course
app.get("/course/:id?", controllers.Course.find);
app.post("/course", controllers.Course.create);
app.put("/course/:id?", controllers.Course.update);
app.del("/course/:id", controllers.Course.destroy);
app.post("/course/destroy", controllers.Course.destroy);
app.get("/coursemeta/:id?", controllers.CourseMeta.find);
app.put("/coursemeta/:id?", controllers.CourseMeta.update);

app.get("/course/listCompanyCreatedCourses/:id", controllers.Course.listCompanyCreatedCourses);
app.get("/course/listTiersCourses/:id", controllers.Course.listTiersCourses);
app.get("/course/listCompanyCourses/:id?", controllers.Course.listCompanyCourses);

//--- Social auth and sessions

app.get("/auth/logout", controllers.Auth.logout);
app.get("/auth/getSession", controllers.Auth.getSession);
app.post("/auth/updateSession", controllers.Auth.updateSession);
app.post("/auth/local", controllers.Auth.local);
app.get("/auth/github/?", controllers.Auth.github);
app.get("/auth/github/callback", controllers.Auth.githubCallback);
app.get("/auth/facebook", controllers.Auth.facebook);
app.get("/auth/facebook/callback", controllers.Auth.facebookCallback);
app.get("/auth/google", controllers.Auth.google);
app.get("/auth/google/callback", controllers.Auth.googleCallback);

//---- Asset
app.get("/asset/getS3Policy", controllers.Asset.getS3Policy);
app.get("/asset/:id?", controllers.Asset.find);
app.post("/asset", controllers.Asset.create);
app.put("/asset/:id?", controllers.Asset.update);
app.del("/asset/:id", controllers.Asset.destroy);

//---- User
app.get("/user/listUsersInTier/:id", controllers.User.listUsersInTier);
app.post("/user/inviteUser", controllers.User.inviteUser);
app.post("/user/update_users_tier", controllers.User.updateUsersTier);
app.post("/user/saveNewUser", controllers.User.saveNewUser);
app.get("/user/listUsersCourses/:id?", requiresLogin, controllers.User.listUsersCourses);
app.post("/user/destroy", controllers.User.destroy);
app.get("/user/fullDetails/:id", controllers.User.fullDetails);
app.post("/user/update", controllers.User.update);
app.get("/user/searchUser/:text", controllers.User.searchUser);
app.get("/user/listUserCoursesRecords/:id", controllers.User.listUserCoursesRecords);
app.get("/user/sendForgotPw/:email", controllers.User.sendForgotPw);
app.get("/user/verifyPasswordReset/:code", controllers.User.verifyPasswordReset);
app.post("/user/updatePassword", controllers.User.updatePassword);

//------- Credits
app.get("/credit/companyCreditsUsed/:id", controllers.Credit.companyCreditsUsed);
app.get("/credit/companyPurchases/:id", controllers.Credit.companyPurchases);
app.get("/credit/companyRecieved/:id", controllers.Credit.companyRecieved);

///-------Tier
app.post("/tier/updateLeaderboard", controllers.Tier.updateLeaderboard);
app.post("/tier/add", controllers.Tier.add);
app.post("/tier/remove", controllers.Tier.remove);
app.post("/tier/list_children_and_count_users", controllers.Tier.listChildrenAndCountUsers);
app.get("/tier/:id?", controllers.Tier.find);
app.post("/tier/update", controllers.Tier.update);
app.post("/tier/createCompany", controllers.Tier.createCompany);
app.get("/tier/addCourseToTier/:tierId?", controllers.Tier.addCourseToTier);
app.get("/tier/removeCourseFromTiers/:tierId?", controllers.Tier.removeCourseFromTiers);
app.get("/tier/searchTiers/:text?", controllers.Tier.searchTiers);
app.post("/tier/distributeCourseToTiers", controllers.Tier.distributeCourseToTiers);

//----- Store
app.post("/store/purchase", controllers.Store.purchase);
app.get("/store/storeCourses", controllers.Store.storeCourses);
app.get("/store/findCards/:id?", controllers.Store.findCards);
app.get("/store/findCredit/:id?", controllers.Store.findCredit);
app.get("/store/deleteCard/:companyId?", controllers.Store.deleteCard);
app.get("/store/getSubscriptions", controllers.Store.getSubscriptions);
app.get("/store/findRecipient/:id?", controllers.Store.getSubscriptions);
app.post("/store/createRecipient", controllers.Store.createRecipient);
app.get("/store/cancelSubscription/:companyId?", controllers.Store.cancelSubscription);
app.get("/store/checkCanAddCourse/:companyId?", controllers.Store.checkCanAddCourse);

//------ Records
app.get("/record/tierReport/:id?", controllers.Record.tierReport);
app.get("/record/create/:userId?", controllers.Record.create);
app.get("/record/updateBookmark/:id?", controllers.Record.updateBookmark);
app.get("/record/userOverallProgress/:userId?", controllers.Record.userOverallProgress);

module.exports = app;
