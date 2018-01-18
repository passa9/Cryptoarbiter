"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _ref(e) {
  return e;
}

function _ref2(e) {
  return e;
}

var Switch = exports.Switch = (patterns, protector = _ref) => (matches, mProtector = _ref2) => (...data) => {
  var keyList = Object.keys(patterns);
  var normalized = protector(...data);
  for (var _iterator = keyList, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
    var _ref3;

    if (_isArray) {
      if (_i >= _iterator.length) break;
      _ref3 = _iterator[_i++];
    } else {
      _i = _iterator.next();
      if (_i.done) break;
      _ref3 = _i.value;
    }

    var key = _ref3;

    if (patterns[key](normalized)) return mProtector(matches[key]);
  }
};

exports.default = Switch;
//# sourceMappingURL=switch.js.map