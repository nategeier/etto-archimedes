"use strict";

var nodemailer = require("nodemailer"),
  conf = require("../../config/local");

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

module.exports.sendMail = function (subj, htmlTxt, toEmail, toPerson, callback) {

  var smtpTransport = nodemailer.createTransport("SMTP", {
    service: conf.email.service,
    auth: {
      user: conf.email.service,
      pass: conf.email.pass
    }
  });

  // setup e-mail data with unicode symbols
  var mailOptions = {
    from: "admin@coursetto.com", // sender address
    to: toEmail, // list of receivers
    subject: subj, // Subject line
    text: "You have been invited to join the team", // plaintext body
    html: htmlTxt // html body
  };

  smtpTransport.sendMail(mailOptions, function (err, response) {
    smtpTransport.close();
    callback(err, response);
  });
};
