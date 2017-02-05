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

  log.debug(`Starting ${module} \n`);

  return new Promise((resolve, reject) => {

    let resultsArray = getResultsArray();

    if (resultsArray.hasOwnProperty(module)) {
      log.info(`Skipping ${module} \n`);
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
        //val: each key in response
        //version: version to seek
        key = keys.filter((val) => {
          try { return semver.satisfies(val, version); }
          catch (e) { return false; }
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
        log.error(`sizePending ${err} \n`);
      });
      promises.push(sizePending);

      //call Walk recursively for each dependencies a module has, till the leaf modules
      for (let name in dependencies) {
        let version = dependencies[name];
        //   ensure valid semver
        //   semver.validRange("~2.0.0"), prints ">=2.0.0 <2.1.0"
        //   semver.validRange("^2.0.0"), prints ">=2.0.0 <3.0.0"
        //   semver.validRange("<2.0.0"), prints "<2.0.0" 
        //   semver.validRange("*"),      prints "*"
        //   semver.validRange("0")       prints ">=0.0.0 <1.0.0"
        //   semver.validRange(""),       prints "*"
        //   semver.validRange("latest"), prints null
        //   semver.validRange("^2.0.0-beta"), prints ">=2.0.0-beta <3.0.0"
        version = semver.validRange(version);
        if (version == "*" || !version || !semver.validRange(version)) {
          log.warn(`Module ${name} doesn't have valid semver \n`);
          //takes the latest
          version = undefined;
        }

        //mutation tricked me for quite some time
        let node = tree ? tree.slice(0) : [];
        node.push(tmpl(name, version));

        // let walk = Walk(name, version, node);
        pushHierarchy(node, version);

        // walk.then((val) => {

        // }).catch((err) => {
        //   log.error(`walk ${module} ${err} \n`);
        // });
        // promises.push(walk);
      }

      Promise
        .all(promises)  //when this module's dependencies resolved
        .then(() => {   //then push the results to global stack object
          /**
           * @param module  modulename with version
           * @param key     version
           * @param name    modulename
           * @param size    size in bytes
           * @param tree    dependencies tree from root
           */
          pushResultsArray({
            module,
            key,
            name,
            size,
            tree
          });
          resolve(module);  //now resolve this module
        }).catch((err) => {
          log.error(`Caught Error: ${err} \n`);
          reject(err);
        });
    });
  });
}
