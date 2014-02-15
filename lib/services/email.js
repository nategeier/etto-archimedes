"use strict";

var nodemailer = require("nodemailer"),
  config = require("../server/config"),
  email = (config.get("email"));

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
    text: "You have been invited to join the team", // plaintext body
    html: htmlTxt // html body
  };

  smtpTransport.sendMail(mailOptions, function (err, response) {
    smtpTransport.close();
    console.log(response);
    callback(err, response);
  });

};
