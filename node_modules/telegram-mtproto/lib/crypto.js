'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CryptoWorker = undefined;

var _when = require('ramda/src/when');

var _when2 = _interopRequireDefault(_when);

var _is = require('ramda/src/is');

var _is2 = _interopRequireDefault(_is);

var _identity = require('ramda/src/identity');

var _identity2 = _interopRequireDefault(_identity);

var _has = require('ramda/src/has');

var _has2 = _interopRequireDefault(_has);

var _both = require('ramda/src/both');

var _both2 = _interopRequireDefault(_both);

var _detectNode = require('detect-node');

var _detectNode2 = _interopRequireDefault(_detectNode);

var _defer = require('./util/defer');

var _defer2 = _interopRequireDefault(_defer);

var _smartTimeout = require('./util/smart-timeout');

var _smartTimeout2 = _interopRequireDefault(_smartTimeout);

var _bin = require('./bin');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var convertIfArray = (0, _when2.default)((0, _is2.default)(Array), _bin.convertToUint8Array);
var webWorker = !_detectNode2.default;
var taskID = 0;
var awaiting = {};
var webCrypto = _detectNode2.default ? false
//eslint-disable-next-line
: window.crypto.subtle || window.crypto.webkitSubtle //TODO remove browser depends
//eslint-disable-next-line
|| window.msCrypto && window.msCrypto.subtle;
var useWebCrypto = webCrypto && !!webCrypto.digest;
var useSha1Crypto = useWebCrypto;
var useSha256Crypto = useWebCrypto;
var finalizeTask = (taskID, result) => {
  var deferred = awaiting[taskID];
  if (deferred) {
    // console.log(rework_d_T(), 'CW done')
    deferred.resolve(result); //TODO Possibly, can be used as
    delete awaiting[taskID]; //
  } //    deferred = Promise.resolve()
}; //    deferred.resolve( result )

var isCryptoTask = (0, _both2.default)((0, _has2.default)('taskID'), (0, _has2.default)('result'));

//eslint-disable-next-line
var workerEnable = !_detectNode2.default && window.Worker;

function _ref(e) {
  if (e.data === 'ready') {
    console.info('CW ready');
  } else if (!isCryptoTask(e.data)) {
    console.info('Not crypto task', e, e.data);
    return e;
  } else return webWorker ? finalizeTask(e.data.taskID, e.data.result) : webWorker = tmpWorker;
}

function _ref2(error) {
  console.error('CW error', error, error.stack);
  webWorker = false;
}

if (workerEnable) {
  var TmpWorker = require('worker-loader?inline!./worker.js');
  var tmpWorker = new TmpWorker();
  // tmpWorker.onmessage = function(event) {
  //   console.info('CW tmpWorker.onmessage', event && event.data)
  // }
  tmpWorker.onmessage = _ref;

  tmpWorker.onerror = _ref2;
  tmpWorker.postMessage('b');
  webWorker = tmpWorker;
}

var performTaskWorker = (task, params, embed) => {
  // console.log(rework_d_T(), 'CW start', task)
  var deferred = (0, _defer2.default)();

  awaiting[taskID] = deferred;

  params.task = task;
  params.taskID = taskID;(embed || webWorker).postMessage(params);

  taskID++;

  return deferred.promise;
};

function _ref3(digest) {
  return (
    // console.log(rework_d_T(), 'Native sha1 done')
    digest
  );
}

var sha1Hash = bytes => {
  function _ref4(e) {
    console.error('Crypto digest error', e);
    useSha1Crypto = false;
    return (0, _bin.sha1HashSync)(bytes);
  }

  if (useSha1Crypto) {
    // We don't use buffer since typedArray.subarray(...).buffer gives the whole buffer and not sliced one.
    // webCrypto.digest supports typed array
    var bytesTyped = convertIfArray(bytes);
    // console.log(rework_d_T(), 'Native sha1 start')
    return webCrypto.digest({ name: 'SHA-1' }, bytesTyped).then(_ref3, _ref4);
  }
  return _smartTimeout2.default.immediate(_bin.sha1HashSync, bytes);
};

var sha256Hash = bytes => {
  function _ref5(e) {
    console.error('Crypto digest error', e);
    useSha256Crypto = false;
    return (0, _bin.sha256HashSync)(bytes);
  }

  if (useSha256Crypto) {
    var bytesTyped = convertIfArray(bytes);
    // console.log(rework_d_T(), 'Native sha1 start')
    return webCrypto.digest({ name: 'SHA-256' }, bytesTyped).then(_identity2.default
    // console.log(rework_d_T(), 'Native sha1 done')
    , _ref5);
  }
  return _smartTimeout2.default.immediate(_bin.sha256HashSync, bytes);
};

var aesEncrypt = (bytes, keyBytes, ivBytes) => _smartTimeout2.default.immediate(() => (0, _bin.convertToArrayBuffer)((0, _bin.aesEncryptSync)(bytes, keyBytes, ivBytes)));

var aesDecrypt = (encryptedBytes, keyBytes, ivBytes) => _smartTimeout2.default.immediate(() => (0, _bin.convertToArrayBuffer)((0, _bin.aesDecryptSync)(encryptedBytes, keyBytes, ivBytes)));

var factorize = bytes => {
  bytes = (0, _bin.convertToByteArray)(bytes);
  return webWorker ? performTaskWorker('factorize', { bytes }) : _smartTimeout2.default.immediate(_bin.pqPrimeFactorization, bytes);
};

var modPow = (x, y, m) => webWorker ? performTaskWorker('mod-pow', {
  x,
  y,
  m
}) : _smartTimeout2.default.immediate(_bin.bytesModPow, x, y, m);

var CryptoWorker = exports.CryptoWorker = {
  sha1Hash,
  sha256Hash,
  aesEncrypt,
  aesDecrypt,
  factorize,
  modPow
};

exports.default = CryptoWorker;
//# sourceMappingURL=crypto.js.map