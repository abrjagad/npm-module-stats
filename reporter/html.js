"use strict";

let template = require("./template");
const objectPath = require("object-path");
const prettyBytes = require("pretty-bytes");
const walk = require("../lib/walk");
const getHierarchy = walk.getHierarchy;
const fs = require("fs");
const log = require("loglevel");

//Dependencies tree as JSON
let tree = getHierarchy();

module.exports = function(stack, totalSize, argv) {
  let result = Object.keys(stack).reduce(
    (prev, node, index) => {
      let dep = stack[node];
      let deps = Object.keys(objectPath.get(tree, dep.tree)).join("<br/>");
      let moduleSize = prettyBytes(dep.size);
      return prev +
        `
              <tr>
                <td class="col-sm-1">${index}</td>
                <td class="col-sm-3">${dep.name}</td>
                <td class="col-sm-2">${dep.key}</td>
                <td class="col-sm-2">${moduleSize}</td>
                <td class="col-sm-4">${deps}</td>
              </tr>`;
    },
    ""
  );

  fs.writeFile(
    argv.output,
    template(
      argv.name,
      result,
      prettyBytes(totalSize),
      prettyBytes(totalSize * 3)
    ),
    (err, res) => {
      if (err) {
        log.error("Failed to output, try another format");
        return;
      }
      process.stdout.write(`\n Output written to ${argv.output}`);
    }
  );
};
