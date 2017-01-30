'use strict';

const log = require('loglevel');
log.setLevel(2);

const Table = require('cli-table2');
const objectPath = require('object-path');
const getRemoteFileSize = require("./remote-file-size");
const Walk = require("./walk");
const stats = require("./stats");

const getStats = stats.getStats;
const getHierarchy = stats.getHierarchy;
const pushHierarchy = stats.pushHierarchy;
const getResultsArray = stats.getResultsArray;
const pushResultsArray = stats.pushResultsArray;


var argv = require('yargs')
  .demand('name', 'Enter name of the npm module to get stats for!')
  .usage('node index --name=glob')
  .example('node index --name=glob', '"Draw a statistics table for the latest version "')
  .example('node index --name=glob@6.0.1', '"Draw a statistics table for the specific version "')
  .options({
    'n': {
      alias: 'name',
      demand: true,
      describe: 'Name of the NPM module to get stats for',
      type: 'string'
    },
    'ot': {
      alias: 'only-total',
      describe: 'Recursive total size of a NPM module with its dependencies size included',
      type: 'boolean'
    },
    'm': {
      alias: 'minimal',
      describe: 'Stats in text representation',
      type: 'boolean'
    },
    'verbose': {
      describe: 'Verbose output',
      type: 'boolean'
    }
  })
  .wrap(120)
  .help()
  .argv;

//control logger
if (argv.verbose) {
  log.enableAll();
}

getStats(argv.n).then((stack) => {

  let totalSize = Object.keys(stack).reduce((result, key, index) => {
    return result + stack[key].size;
  }, 0);

  if (argv.ot) {
    console.log('Total Size ', totalSize);
    return;
  }

  if (argv.m) {
    console.log('Total Size ', totalSize);
    console.log('Total Dependencies ', Object.keys(stack).length);
    return;
  }

  let tree = getHierarchy();
  let table = new Table({ head: ['INDEX', 'NAME', 'VERSION', 'SIZE', 'DEPS'] });

  let j = 0;
  for (let i in stack) {

    let dep = stack[i];
    let deps = Object.keys(objectPath.get(tree, dep.tree)).join("\n");

    table.push([
      ++j,
      dep.name,
      dep.key,
      dep.size,
      deps
    ]);
  }

  table.push([, , , totalSize])


  console.log(table.toString());


}).catch((err) => {
  log.error('Error has occured. Please raise a Git issue incase of code issue. \n', err);
});


module.exports = {
  getStats,
  getHierarchy,
  getResultsArray,
  pushHierarchy,
  pushResultsArray,
  getRemoteFileSize,
  Walk
}