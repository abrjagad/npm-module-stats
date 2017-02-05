'use strict';

const log = require('loglevel');

let npm = require("npm");
const objectPath = require('object-path');

/** Object to hold the modules info */
let stack = {};
let tree = {};

/**
 * Fn to push new object into stack returned by
 * each Walk function
 */
module.exports.pushResultsArray = function pushResultsArray(obj) {
  if (!stack.hasOwnProperty(obj.module)) {
    stack[obj.module] = obj;
  }
};

/**
 * Fn to get the current state of stack object
 */
module.exports.getResultsArray = function getResultsArray() {
  return stack;
};

/**
 * Fn to push new object into stack returned by
 * each Walk function
 */
module.exports.pushHierarchy = function pushHierarchy(node, version) {
  objectPath.set(tree, node, {});
};

/**
 * Fn to get the current state of stack object
 */
module.exports.getHierarchy = function getHierarchy() {
  return tree;
};

// let Walk = require("./walk");

/**
 * Accepts a npm module name and returns a promise
 */
module.exports.getStats = function getStats(moduleName, version) {
  return new Promise((resolve, reject) => {
    npm.load({ loglevel: "silent" }, function () {
      require("./walk")(moduleName, version).then((response) => {
        resolve(stack);
      }).catch((err) => {
        reject(err);
      });
    });
  });
};
