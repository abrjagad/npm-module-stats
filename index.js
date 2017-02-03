'use strict';

const stats = require("./lib/stats");
const Walk = require("./lib/walk");
const getRemoteFileSize = require("./lib/remote-file-size");
const getStats = stats.getStats;
const getHierarchy = stats.getHierarchy;
const pushHierarchy = stats.pushHierarchy;
const getResultsArray = stats.getResultsArray;
const pushResultsArray = stats.pushResultsArray;

module.exports = {
  getStats,
  getHierarchy,
  getResultsArray,
  pushHierarchy,
  pushResultsArray,
  getRemoteFileSize,
  Walk
};
