"use strict";

const getStats = require("./lib/stats");
const Walk = require("./lib/walk");
const getRemoteFileSize = require("./lib/remote-file-size");

const pushHierarchy = Walk.pushHierarchy;
const getHierarchy = Walk.getHierarchy;
const getResultsArray = Walk.getResultsArray;
const pushResultsArray = Walk.pushResultsArray;

module.exports = {
  getStats,
  getHierarchy,
  getResultsArray,
  pushHierarchy,
  pushResultsArray,
  getRemoteFileSize,
  Walk
};
