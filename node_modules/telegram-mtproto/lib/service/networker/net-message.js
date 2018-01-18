'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.NetContainer = exports.NetMessage = undefined;

var _forEachObjIndexed = require('ramda/src/forEachObjIndexed');

var _forEachObjIndexed2 = _interopRequireDefault(_forEachObjIndexed);

var _timeManager = require('../time-manager');

var _defer = require('../../util/defer');

var _defer2 = _interopRequireDefault(_defer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class NetMessage {
  constructor(seq_no, body) {
    this.acked = false;
    this.msg_id = (0, _timeManager.generateID)();
    this.container = false;
    this.deferred = (0, _defer2.default)();

    this.copyHelper = (value, key) => {
      //$FlowIssue
      this[key] = value;
    };

    this.seq_no = seq_no;
    this.body = body;
  }
  copyOptions(options) {
    //TODO remove this
    (0, _forEachObjIndexed2.default)(this.copyHelper, options);
  }

  size() {
    if (this.body instanceof Uint8Array) return this.body.byteLength;else return this.body.length;
  }
}

exports.NetMessage = NetMessage;
class NetContainer extends NetMessage {
  constructor(seq_no, body, inner) {
    super(seq_no, body);
    this.container = true;
    this.inner = inner;
  }
}
exports.NetContainer = NetContainer;
//# sourceMappingURL=net-message.js.map