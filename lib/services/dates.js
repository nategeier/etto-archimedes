"use strict";



/**
* Date Service
----
 *
 */

module.exports.fortnightAway = function () {

  var currentTime = new Date();
  var fortnightAway = currentTime.setDate(currentTime.getDate() + 14);

  return fortnightAway;

};



module.exports.dateViewFormated = function (date) {
  var day = Number(date.getMonth() + 1);
  var month = date.getDate();
  var year = date.getFullYear();

  var dateFormatted = day + " " + month + ", " + year;
  return dateFormatted;
};
