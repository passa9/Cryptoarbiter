'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _has = require('ramda/src/has');

var _has2 = _interopRequireDefault(_has);

var _pathEq = require('ramda/src/pathEq');

var _pathEq2 = _interopRequireDefault(_pathEq);

var _allPass = require('ramda/src/allPass');

var _allPass2 = _interopRequireDefault(_allPass);

var _http = require('../../http');

var _http2 = _interopRequireDefault(_http);

var _error = require('../../error');

var _timeManager = require('../time-manager');

var _tl = require('../../tl');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var is404 = (0, _pathEq2.default)(['response', 'status'], 404);
var notError = (0, _allPass2.default)([(0, _has2.default)('message'), (0, _has2.default)('type')]);

function _ref(err) {
  var error = void 0;
  switch (true) {
    case is404(err):
      error = new _error.ErrorNotFound(err);
      break;
    case notError(err):
      error = new _error.ErrorBadResponse('', err);
      break;
    default:
      error = err;
  }
  return _bluebird2.default.reject(error);
}

var SendPlain = ({ Serialization, Deserialization }) => {
  var onlySendPlainReq = (url, requestBuffer) => {
    var requestLength = requestBuffer.byteLength,
        requestArray = new Int32Array(requestBuffer);

    var header = Serialization();
    var headBox = header.writer;

    _tl.WriteMediator.longP(headBox, 0, 0, 'auth_key_id'); // Auth key
    _tl.WriteMediator.long(headBox, (0, _timeManager.generateID)(), 'msg_id'); // Msg_id
    _tl.WriteMediator.int(headBox, requestLength, 'request_length');

    var headerBuffer = headBox.getBuffer(),
        headerArray = new Int32Array(headerBuffer);
    var headerLength = headerBuffer.byteLength;

    var resultBuffer = new ArrayBuffer(headerLength + requestLength),
        resultArray = new Int32Array(resultBuffer);

    resultArray.set(headerArray);
    resultArray.set(requestArray, headerArray.length);

    var requestData = resultArray;
    // let reqPromise
    // try {
    var reqPromise = _http2.default.post(url, requestData, {
      responseType: 'arraybuffer'
    });
    // } catch (e) {
    //   reqPromise = Promise.reject(new ErrorBadResponse(url, e))
    // }
    return _bluebird2.default.props({ url, req: reqPromise });
  };

  var onlySendPlainErr = _ref;

  var onlySendPlainRes = ({ url, req }) => {
    if (!req.data || !req.data.byteLength) return _bluebird2.default.reject(new _error.ErrorBadResponse(url));
    var deserializer = void 0;
    try {
      deserializer = Deserialization(req.data, { mtproto: true });
      var ctx = deserializer.typeBuffer;
      _tl.ReadMediator.long(ctx, 'auth_key_id');
      _tl.ReadMediator.long(ctx, 'msg_id');
      _tl.ReadMediator.int(ctx, 'msg_len');
    } catch (e) {
      return _bluebird2.default.reject(new _error.ErrorBadResponse(url, e));
    }

    return deserializer;
  };

  var sendPlainReq = (url, requestBuffer) => onlySendPlainReq(url, requestBuffer).then(onlySendPlainRes, onlySendPlainErr);

  return sendPlainReq;
};

exports.default = SendPlain;
//# sourceMappingURL=send-plain-req.js.map