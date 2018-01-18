'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setLogger = undefined;

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _trim = require('ramda/src/trim');

var _trim2 = _interopRequireDefault(_trim);

var _map = require('ramda/src/map');

var _map2 = _interopRequireDefault(_map);

var _chain = require('ramda/src/chain');

var _chain2 = _interopRequireDefault(_chain);

var _pipe = require('ramda/src/pipe');

var _pipe2 = _interopRequireDefault(_pipe);

var _split = require('ramda/src/split');

var _split2 = _interopRequireDefault(_split);

var _both = require('ramda/src/both');

var _both2 = _interopRequireDefault(_both);

var _is = require('ramda/src/is');

var _is2 = _interopRequireDefault(_is);

var _when = require('ramda/src/when');

var _when2 = _interopRequireDefault(_when);

var _take = require('ramda/src/take');

var _take2 = _interopRequireDefault(_take);

var _reject = require('ramda/src/reject');

var _reject2 = _interopRequireDefault(_reject);

var _isEmpty = require('ramda/src/isEmpty');

var _isEmpty2 = _interopRequireDefault(_isEmpty);

var _join = require('ramda/src/join');

var _join2 = _interopRequireDefault(_join);

var _unapply = require('ramda/src/unapply');

var _unapply2 = _interopRequireDefault(_unapply);

var _unnest = require('ramda/src/unnest');

var _unnest2 = _interopRequireDefault(_unnest);

var _tail = require('ramda/src/tail');

var _tail2 = _interopRequireDefault(_tail);

var _dtime = require('./dtime');

var _dtime2 = _interopRequireDefault(_dtime);

var _smartTimeout = require('./smart-timeout');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// import memoize from 'memoizee'

var tagNormalize = e => `[${e}]`;

var arrify = (0, _unapply2.default)(_unnest2.default);

var fullNormalize = (0, _pipe2.default)(arrify, (0, _chain2.default)((0, _split2.default)(',')), (0, _map2.default)(_trim2.default), (0, _reject2.default)(_isEmpty2.default), (0, _map2.default)(tagNormalize), (0, _join2.default)(''));

var stringNormalize = (0, _when2.default)((0, _both2.default)((0, _is2.default)(String), e => e.length > 50), (0, _take2.default)(150));
// const isSimple = either(
//   is(String),
//   is(Number)
// )

// const prettify = unless(
//   isSimple,
//   pretty
// )

var genericLogger = (0, _debug2.default)('telegram-mtproto');

class LogEvent {
  constructor(log, values) {
    this.log = log;
    this.values = values;
  }
  print() {
    this.log(...this.values);
  }
}

class Sheduler {
  constructor() {
    this.queue = [];
    this.buffer = [];

    this.add = (log, time, tagStr, values) => {
      var results = values.map(stringNormalize);
      var first = results[0] || '';
      var other = (0, _tail2.default)(results);
      var firstLine = [tagStr, time, first].join('  ');
      this.buffer.push(new LogEvent(log, [firstLine, ...other]));
    };

    this.sheduleBuffer = () => {
      this.queue.push(this.buffer);
      this.buffer = [];
    };

    this.print = () => {
      for (var _iterator = this.queue, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
        var _ref;

        if (_isArray) {
          if (_i >= _iterator.length) break;
          _ref = _iterator[_i++];
        } else {
          _i = _iterator.next();
          if (_i.done) break;
          _ref = _i.value;
        }

        var buffer = _ref;

        for (var _iterator2 = buffer, _isArray2 = Array.isArray(_iterator2), _i2 = 0, _iterator2 = _isArray2 ? _iterator2 : _iterator2[Symbol.iterator]();;) {
          var _ref2;

          if (_isArray2) {
            if (_i2 >= _iterator2.length) break;
            _ref2 = _iterator2[_i2++];
          } else {
            _i2 = _iterator2.next();
            if (_i2.done) break;
            _ref2 = _i2.value;
          }

          var logEvent = _ref2;

          logEvent.print();
        }
      }this.queue = [];
    };

    setInterval(this.sheduleBuffer, 50);
    setInterval(this.print, 300);
  }
}

var sheduler = new Sheduler();

var Logger = (moduleName, ...rest) => {
  var fullModule = arrify(moduleName, ...rest);
  fullModule.unshift('telegram-mtproto');
  var fullname = fullModule.join(':');
  var debug = (0, _debug2.default)(fullname);
  var logger = tags => {
    var tagStr = fullNormalize(tags);
    return (...objects) => {
      var time = (0, _dtime2.default)();
      (0, _smartTimeout.immediate)(sheduler.add, debug, time, tagStr, objects);
    };
  };
  return logger;
};

var setLogger = exports.setLogger = customLogger => {
  _debug2.default.log = customLogger;
};

exports.default = Logger;
//# sourceMappingURL=log.js.map