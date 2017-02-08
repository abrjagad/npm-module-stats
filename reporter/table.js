"use strict";

const Table = require("cli-table2");
const objectPath = require("object-path");
const prettyBytes = require("pretty-bytes");
const walk = require("../lib/walk");
const getHierarchy = walk.getHierarchy;

//Dependencies tree as JSON
let tree = getHierarchy();

module.exports = function(stack, totalSize, argv) {
  let table = new Table({
    head: ["INDEX", "NAME", "VERSION", "SIZE", "DEPS"]
  });

  Object.keys(stack).forEach((node, index) => {
    if (argv.format === "less" && index > 10) {
      return;
    }
    let dep = stack[node];
    let deps = Object.keys(objectPath.get(tree, dep.tree)).join("\n");

    table.push([index + 1, dep.name, dep.key, prettyBytes(dep.size), deps]);
  });

  table.push(
    [, , , "Exact compressed \nfile size \n" + prettyBytes(totalSize)],
    [
      ,
      ,
      ,
      "Appromixate file \nsize after \nuncompression \n" +
        prettyBytes(totalSize * 3)
    ]
  );

  console.log(table.toString());
};
