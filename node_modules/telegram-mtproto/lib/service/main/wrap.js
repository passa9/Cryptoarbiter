'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _index = require('./index');

var _index2 = _interopRequireDefault(_index);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function MTProto(config = {}) {
  var mtproto = new _index2.default(config);
  return mtproto.api;
}

exports.default = MTProto;
//# sourceMappingURL=wrap.js.map