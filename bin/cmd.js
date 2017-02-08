#!/usr/bin/env node

"use strict";
const log = require("loglevel");
log.setLevel(3);

const getStats = require("../lib/stats");

const argv = require("yargs")
  .usage("npm-module-stats --name=glob")
  .example(
    "npm-module-stats --n=glob",
    '"Draw a statistics table for the latest version "'
  )
  .example(
    "npm-module-stats --n=glob --version='^6.0.1'",
    '"Draw a statistics table for the specific version "'
  )
  .example(
    "npm-module-stats --n=glob --format=html",
    '"Ouput generated in HTML file "'
  )
  .example("npm-module-stats --name=glob --verbose", '"verbose output "')
  .options({
    name: {
      demand: true,
      alias: "n",
      describe: "Name of the NPM module to get stats for",
      type: "string"
    },
    version: {
      describe: "Version of the NPM module to get stats for",
      type: "string"
    },
    output: {
      type: "string",
      describe: "Output file name",
      default: "npm-module-stats.html"
    },
    format: {
      type: "string",
      choices: ["less", "minimal", "table", "html"],
      describe: "Output format",
      default: "table"
    },
    verbose: {
      describe: "Verbose output",
      type: "boolean"
    }
  })
  .wrap(90)
  .help().argv;

//control logger
if (argv.verbose) {
  log.enableAll();
}

getStats(argv.n, argv.version)
  .then(stack => {
    //find the total size of all modules
    let totalSize = Object.keys(stack).reduce(
      (result, key, index) => {
        return result + stack[key].size;
      },
      0
    );

    //reporter
    switch (argv.format) {
      case "minimal":
        require("../reporter/minimal")(
          totalSize,
          Object.keys(stack).length - 1
        );
        break;
      case "html":
        require("../reporter/html")(stack, totalSize, argv);
        break;
      default:
        require("../reporter/table")(stack, totalSize, argv);
    }
  })
  .catch(err => {
    log.error(
      "Error has occured. Please raise a Git issue incase of code issue. \n",
      err
    );
  });
