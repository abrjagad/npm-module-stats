'use strict';

const log = require('loglevel');
let request = require('request');

//get only the HEAD
let options = {
  method: 'HEAD',
  followAllRedirects: true,
};

/**
 * @param url {string} tarball url
 * @param module {string} module name
 */
module.exports = function getRemoteFileSize(url, module) {

  let opts = Object.assign({}, options, { uri: url });

  return new Promise((resolve, reject) => {

    //request
    request(opts, function (err, res, body) {

      log.debug('Requesting module', module);

      if (err) {
        reject(err);
        return;
      }

      const code = res.statusCode;

      if (code >= 400) {
        reject(new Error('Received invalid status code: ' + code));
        return;
      }

      //get the zipped size
      const len = parseInt(res.headers['content-length']);

      if (!len) {
        reject(new Error('Unable to determine file size'));
        return;
      }

      resolve(len);
    });
  });
};
