'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _randombytes = require('randombytes');

var _randombytes2 = _interopRequireDefault(_randombytes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var getRandom = arr => {
  var ln = arr.length;
  var buf = (0, _randombytes2.default)(ln);
  for (var i = 0; i < ln; i++) {
    arr[i] = buf[i];
  }return arr;
};

exports.default = getRandom;
//# sourceMappingURL=secure-random.js.map