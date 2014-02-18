"use strict";

/**
 * Loads configuration via nconf
 ```

{
  "baseurl": "localhost:9010",
  "session": {
    "secret": "SECRET"
  },
  "email": {
    "service": "Gmail",
    "user": "USER@USER.COM",
    "pass": "PASSWORD",
    "from": "admin@coursetto.com"
  },
  "passport": {
    "github": {
      "clientID": "clientID",
      "clientSecret": "clientSecret",
      "passReqToCallback": "true"
    },
    "facebook": {
      "clientID": "clientID",
      "clientSecret": "clientSecret",
      "passReqToCallback": "true"
    },
    "google": {
      "clientID": "clientID",
      "clientSecret": "clientSecret",
      "passReqToCallback": "true"
    }
  },
  "stripe": {
    "secret": "SECRET"
  },
  "salt": "1we@he!"
}
```
 * @module      server/config

 */
var nconf = require("nconf"),
  path = require("path");

function Config() {
  nconf.argv().env();

  var environment = nconf.get("NODE_ENV") || "development";

  nconf.file("local", path.resolve("config", "local.json"));
  nconf.file(environment, path.resolve("config", environment + ".json"));
  nconf.file("default", path.resolve("config", "default.json"));

  nconf.defaults({
    port: process.env.PORT || 4220
  });
}

Config.prototype.get = function (key) {
  return nconf.get(key);
};

module.exports = new Config();
