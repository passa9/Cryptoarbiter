'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.delayedCall = exports.immediate = exports.smartTimeout = undefined;

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var cancelToken = Symbol('cancel token');

var timeoutRefs = new WeakSet();

var pause = delay => new _bluebird2.default(r => setTimeout(r, delay));

var smartTimeout = exports.smartTimeout = (fn, delay = 0, ...args) => {
  var newToken = Symbol('cancel id');
  var checkRun = () => {
    if (timeoutRefs.has(newToken)) {
      timeoutRefs.delete(newToken);
      return fn(...args);
    } else return false;
  };
  var promise = pause(delay).then(checkRun);
  promise[cancelToken] = newToken;
  return promise;
};

smartTimeout.cancel = promise => {
  if (!promise || !promise[cancelToken]) return false;
  var token = promise[cancelToken];
  return timeoutRefs.has(token) ? timeoutRefs.delete(token) : false;
};

var immediate = exports.immediate = (fn, ...args) => _bluebird2.default.resolve().then(() => fn(...args));

var delayedCall = exports.delayedCall = (fn, delay = 0, ...args) => pause(delay).then(() => fn(...args));

smartTimeout.immediate = immediate;
smartTimeout.promise = delayedCall;

exports.default = smartTimeout;
//# sourceMappingURL=smart-timeout.js.map