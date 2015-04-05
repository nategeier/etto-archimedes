"use strict";

var nodemailer = require("nodemailer"),
  config = require("../server/config"),
  email = (config.get("email")),
  Dates = require("./dates");

/**
* Email Service
put your cridentials in the config/locals
----
```
{
    "baseurl": "localhost:9010",
    "session": {
    "secret": "SECRET"
  },
  "email": {
    "service": "Gmail",
    "user": "YOUR EMAIL",
    "pass" : "YOUR PASS"
  },
  "passport": {

  }
}
```
 *
 */

var sendMail = function (subj, htmlTxt, toEmail, toPerson, callback) {

  var smtpTransport = nodemailer.createTransport("SMTP", {
    service: email.service,
    auth: {
      user: email.user,
      pass: email.pass
    }
  });

  // setup e-mail data with unicode symbols
  var mailOptions = {
    from: email.from, // sender address
    to: toEmail, // list of receivers
    subject: subj, // Subject line
    text: subj, // plaintext body
    html: htmlTxt // html body
  };

  smtpTransport.sendMail(mailOptions, function (err, response) {
    smtpTransport.close();
    callback(err, response);
  });

};

var justRegisteredEmail = function (user, done) {

  var fortnightAwayDate = new Date(Dates.fortnightAway());
  var fortnightAway = Dates.dateViewFormated(fortnightAwayDate);

  var companyName = "your company";
  if (user.tierTitle) {
    companyName = user.tierTitle;
  }

  var htmlTxt = "<p>Hi " + user.name + ",</p>";
  htmlTxt += "<p>It's a pleasure to have " + companyName + " trying us out.</p>";
  htmlTxt += "<p>With our commitment to web integrations, beautiful mobile design, and reportings, joining Coursetto is a step in the right direction to streamlining your company's learning process.</p>";
  htmlTxt += "<p>If you’d like to schedule a time for an introductory meeting, we’d be happy set aside time to see how we could collaborate.</p>";
  htmlTxt += "<p>Your free trial will end on " + fortnightAway + "</p>";
  htmlTxt += "<p>With Regards,</p>";
  htmlTxt += "<p>Nate</p><br>";

  htmlTxt += "<p>Nate Geier | CEO</p>";
  htmlTxt += "<p>+1(541) 521-7967</p>";
  htmlTxt += "<p>nate@coursetto.com</p>";
  htmlTxt += "<a href= 'https://coursetto.com'>Coursetto, Inc.</p>";

  sendMail("Consider Coursetto for Pilot", htmlTxt, user.emails, "toPerson", function (err, results) {
    done(err, results);
  });

};



module.exports = {
  sendMail: sendMail,
  justRegisteredEmail: justRegisteredEmail
};
