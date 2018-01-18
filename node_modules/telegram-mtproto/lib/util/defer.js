'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.blueDefer = undefined;

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Defered promise like in Q and $q
 *
 * @returns {{ resolve: (res: any) => void, reject: (res: any) => void, promise: Promise<{}> }}
 */
var blueDefer = exports.blueDefer = () => {
  var resolve = void 0,
      reject = void 0;
  var promise = new _bluebird2.default((rs, rj) => {
    resolve = rs;
    reject = rj;
  });
  return {
    resolve,
    reject,
    promise
  };
};

exports.default = blueDefer;
//# sourceMappingURL=defer.js.map