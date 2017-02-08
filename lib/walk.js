"use strict";

const log = require("loglevel");

let npm = require("npm");
let semver = require("semver");
let getRemoteFileSize = require("./remote-file-size");
const objectPath = require("object-path");
const fs = require("fs");

/** Object to hold the modules info */
let stack = {};
let depsTree = {};

/**
 * Fn to push new object into stack returned by
 * each Walk function
 */
function pushResultsArray(obj, size) {
  if (typeof obj === "string" && obj in stack) {
    stack[obj]["size"] = size;
    return;
  }
  if (!(obj.module in stack)) {
    stack[obj.module] = obj;
  }
}

/**
 * Fn to get the current state of stack object
 */
function getResultsArray() {
  return stack;
}

/**
 * Fn to push new object into stack returned by
 * each Walk function
 */
function pushHierarchy(node, version) {
  objectPath.set(depsTree, node, {});
}

/**
 * Fn to get the current state of stack object
 */
function getHierarchy() {
  return depsTree;
}

function tmpl(name, version) {
  return version ? `${name}@${version}` : name;
}

/**
 * @param name {string} module name
 * @param version {string} valid semversion
 * @param tree {string} Array of hierarchy from root
 */
function Walk(name, version, tree) {
  //module becomes like react@1.5.0 react@^0.0.1
  let module = tmpl(name, version);

  log.debug(`Starting ${module} \n`);

  return new Promise((resolve, reject) => {
    npm.commands.view([module], true, (err, response) => {
      if (err) {
        reject(err);
        return;
      }

      let originalName,
        sizePending,
        size = 0,
        res,
        tarball,
        deps,
        key,
        keys = Object.keys(response),
        proms = [],
        len = keys.length;

      //when you query the npm with identifier like ~ ^ , it gives more than one version
      if (len > 1) {
        //return max-satisfying version

        //val: each key in response
        //version: version to seek
        key = keys
          .filter(val => {
            try {
              return semver.satisfies(val, version);
            } catch (e) {
              return false;
            }
          })
          .pop();
      } else if (len === 1) {
        key = keys[0];
      } else {
        reject("Something went wrong, check your version " + module);
        return;
      }

      //eg: npm-publish-all@0.0.3
      originalName = `${name}@${key}`;

      //update global stack
      /**
       * @param module  modulename with version
       * @param key     version
       * @param name    modulename
       * @param tree    deps tree from root
       */
      pushResultsArray({
        module: originalName,
        key,
        name,
        tree
      });

      //consume the response
      res = response[key];
      tarball = res.dist.tarball;
      deps = res.dependencies || {};

      //call Walk recursively for each deps a module has, till the leaf modules
      Object.keys(deps).forEach(name => {
        let versionKey = deps[name];
        //   ensure valid semver
        //   semver.validRange("~2.0.0"), prints ">=2.0.0 <2.1.0"
        //   semver.validRange("^2.0.0"), prints ">=2.0.0 <3.0.0"
        //   semver.validRange("<2.0.0"), prints "<2.0.0"
        //   semver.validRange("*"),      prints "*"
        //   semver.validRange("0")       prints ">=0.0.0 <1.0.0"
        //   semver.validRange(""),       prints "*"
        //   semver.validRange("latest"), prints null
        //   semver.validRange("^2.0.0-beta"), prints ">=2.0.0-beta <3.0.0"
        version = semver.validRange(versionKey);
        if (version == "*" || !version || !semver.validRange(version)) {
          log.warn(`Module ${name} doesn't have valid semver \n`);
          //takes the latest
          version = undefined;
        }

        let depsName = tmpl(name, versionKey);
        //mutation tricked me for quite some time
        let node = tree ? tree.slice(0) : [];

        /**
           * Skip Cyclic references,
           * A -> B -> A -> B
           */
        //Array.indexof is faster than "in" operator
        if (
          Object.keys(stack).indexOf(depsName) >= 0 ||
            node.indexOf(depsName) >= 0
        ) {
          log.info(`Skipping ${module} ${originalName} ${tree} \n`);
        } else {
          node.push(tmpl(name, versionKey));

          let walk = Walk(name, version, node);
          proms.push(walk);
          pushHierarchy(node, versionKey);

          walk.then(val => {}).catch(err => {
            log.error(`walk ${module} ${err} \n`);
          });
        }
      });

      //when this module's deps resolved
      Promise.all(proms)
        .then(() => {
          //if size is already calculated
          if (
            Object.keys(stack).indexOf(originalName) >= 0 &&
              stack[originalName].size
          ) {
            resolve(module);
            return;
          }
        })
        .catch(err => {
          log.error(`Caught Error: ${err} \n`);
          reject(err);
        })
        .then(() => {
          //get the size of the tarball
          return getRemoteFileSize(tarball, originalName);
        })
        .then(size => {
          //set size once promise is resolved
          //then push the results to global stack object
          /**
           * @param originalName    modulename
           * @param size            size in bytes
           */
          pushResultsArray(originalName, size);
        })
        .catch(err => {
          log.error(`Couldn't get size: ${err} \n`);
          pushResultsArray(originalName, 0);
        })
        .then(function() {
          resolve(module);
        });
    });
  });
}

exports = module.exports = Walk;
exports.getHierarchy = getHierarchy;
exports.pushResultsArray = pushResultsArray;
exports.getResultsArray = getResultsArray;
exports.pushHierarchy = pushHierarchy;
