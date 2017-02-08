"use strict";

const log = require("loglevel");
let npm = require("npm");

let getResultsArray = require("./walk").getResultsArray;

/**
 * Accepts a npm module name and returns a promise
 */
module.exports = function getStats(moduleName, version) {
  return new Promise((resolve, reject) => {
    npm.load({ loglevel: "silent" }, function() {
      require("./walk")(moduleName, version)
        .then(() => {
          resolve(getResultsArray());
          console.log("\nResults:");
        })
        .catch(err => {
          console.log("\nError:");
          reject(err);
        });
    });
  });
};
