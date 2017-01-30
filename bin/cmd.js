#!/usr/bin/env node

const log = require('loglevel');
log.setLevel(2);

const Table = require('cli-table2');
const objectPath = require('object-path');

const stats = require("../lib/stats");
const getStats = stats.getStats;
const getHierarchy = stats.getHierarchy;


var argv = require('yargs')
  .usage('npm-module-stats --name=glob')
  .example('npm-module-stats --n=glob', '"Draw a statistics table for the latest version "')
  .example('npm-module-stats --n=glob@6.0.1', '"Draw a statistics table for the specific version "')
  .example('npm-module-stats --n=glob --m', '"Recursive total size "')
  .example('npm-module-stats --name=glob --m --v', '"verbose output "')
  .options({
    'name': {
      demand: true,
      alias: 'n',
      describe: 'Name of the NPM module to get stats for',
      type: 'string'
    },
    'minimal': {
      alias: 'm',
      describe: 'Stats in text representation',
      type: 'boolean'
    },
    'verbose': {
      describe: 'Verbose output',
      type: 'boolean'
    }
  })
  .wrap(90)
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