'use strict';

var _bin = require('./bin');

console.info('Crypto worker registered');

var runTask = data => {
  switch (data.task) {
    case 'factorize':
      return (0, _bin.pqPrimeFactorization)(data.bytes);
    case 'mod-pow':
      return (0, _bin.bytesModPow)(data.x, data.y, data.m);
    case 'sha1-hash':
      return (0, _bin.sha1HashSync)(data.bytes);
    case 'aes-encrypt':
      return (0, _bin.aesEncryptSync)(data.bytes, data.keyBytes, data.ivBytes);
    case 'aes-decrypt':
      return (0, _bin.aesDecryptSync)(data.encryptedBytes, data.keyBytes, data.ivBytes);
    default:
      throw new Error(`Unknown task: ${data.task}`);
  }
};

onmessage = function (e) {
  if (e.data === '') {
    console.info('empty crypto task');
  } else if (typeof e.data === 'string') {
    console.info('crypto task string message', e.data);
  } else {
    var taskID = e.data.taskID;
    var result = runTask(e.data);
    postMessage({ taskID, result });
  }
};

postMessage('ready');
//# sourceMappingURL=worker.js.map