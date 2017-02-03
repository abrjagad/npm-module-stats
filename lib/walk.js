'use strict';

const log = require('loglevel');

let npm = require("npm");
let semver = require("semver");
let getRemoteFileSize = require("./remote-file-size");
let stats = require("./stats");

let pushResultsArray = stats.pushResultsArray;
let pushHierarchy = stats.pushHierarchy;
let getResultsArray = stats.getResultsArray;

function tmpl(name, version) {
  return version ? `${name}@${version}` : name;
}

/**
 * @param name {string} module name
 * @param version {string} valid semversion
 * @param parentType {string} Tells whether this module descends from dependencies or devDependencies of the root module
 */
module.exports = function Walk(name, version, tree) {

  //module becomes like react@1.5.0 react@^0.0.1
  let module = tmpl(name, version)

  log.debug("Starting " + module);

  return new Promise((resolve, reject) => {

    let resultsArray = getResultsArray();

    if (resultsArray.hasOwnProperty(module)) {
      log.info("Skipping " + module);
      resolve(module);
      return;
    }

    npm.commands.view([module], true, (err, response) => {

      if (err) {
        reject(err);
        return;
      }

      let sizePending, size, res, tarball, dependencies, devDependencies, key, keys = Object.keys(response), promises = [], len = keys.length;

      //when you query the npm with identifier like ~ ^ , it gives more than one version 
      if (len > 1) {
        //return max-satisfying version
        key = keys.filter((val) => {
          return semver.satisfies(val, version);
        }).pop();
      }
      else if (len === 1) {
        key = keys[0];
      }
      else {
        reject("Something went wrong, check your version " + module);
        return;
      }

      res = response[key];
      tarball = res.dist.tarball;
      dependencies = res.dependencies;

      //get the size of the tarball
      sizePending = getRemoteFileSize(tarball, module);
      sizePending.then((val) => {
        //set size once promise is resolved
        size = val;
      }).catch((err) => {
        log.error('sizePending', err);
      });
      promises.push(sizePending);

      //call Walk recursively for each dependencies a module has, till the leaf modules
      for (let name in dependencies) {
        //tricked me for quite some time
        //[].slice(0) creates a clone of an array
        let version = dependencies[name];
        let node = tree ? tree.slice(0) : [];
        node.push(tmpl(name, version));

        let walk = Walk(name, version, node);
        pushHierarchy(node, version);

        walk.then((val) => {

        }).catch((err) => {
          log.error('walk', module, err);
        });
        promises.push(walk);
      }

      Promise
        .all(promises)  //when this module's dependencies resolved
        .then(() => {   //then push the results to global stack object
          pushResultsArray({
            module,
            key,
            name,
            size,
            tree
          });
          resolve(module);  //now resolve this module
        }).catch((err) => {
        log.error("Caught Error: ", err);
        reject(err);
      });
    });
  });
}
