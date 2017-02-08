"use strict";

const log = require("loglevel");
const https = require("https");
const url = require("url");

/**
 * @param url {string} tarball url
 * @param module {string} module name
 */
module.exports = function getRemoteFileSize(uri, module) {
  let parsedUrl = url.parse(uri);
  let retry = 0;

  var options = {
    hostname: parsedUrl.hostname,
    path: parsedUrl.path,
    method: "HEAD"
  };

  return new Promise((resolve, reject) => {
    process.stdout.write(`\r Requesting module ${module}`);
    getHeader();

    function getHeader() {
      var req = https.request(options, res => {
        //get the zipped size
        const len = parseInt(res.headers["content-length"]);

        if (!len) {
          reject(new Error("Unable to determine file size"));
          return;
        }

        resolve(len);
      });
      req.on("error", e => {
        //retry for 10 times in 500ms interval
        if (retry < 10) {
          process.stdout.write(`\r Retrying module ${module}`);
          retry++;
          setTimeout(getHeader, 500);
        } else {
          console.error(e);
          reject(e);
        }
      });
      req.end();
    }
  });
};
