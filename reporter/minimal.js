"use strict";
const prettyBytes = require("pretty-bytes");

module.exports = function(totalSize, len) {
  console.log("Total Size ", prettyBytes(totalSize));
  console.log("Total Dependencies ", len);
};
