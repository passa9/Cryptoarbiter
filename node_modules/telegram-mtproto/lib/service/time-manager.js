'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.generateID = exports.applyServerTime = exports.dTime = exports.tsNow = undefined;

var _dtime = require('../util/dtime');

Object.defineProperty(exports, 'dTime', {
  enumerable: true,
  get: function () {
    return _dtime.dTime;
  }
});

var _detectNode = require('detect-node');

var _detectNode2 = _interopRequireDefault(_detectNode);

var _store = require('../store');

var _bin = require('../bin');

var _log = require('../util/log');

var _log2 = _interopRequireDefault(_log);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var log = _log2.default`time-manager`;

var tsNow = exports.tsNow = seconds => {
  var t = +new Date();
  //eslint-disable-next-line
  if (!_detectNode2.default) t += window.tsOffset || 0;
  return seconds ? Math.floor(t / 1000) : t;
};

var lastMessageID = [0, 0];
var timerOffset = 0;

var offset = _store.TimeOffset.get();
if (offset) timerOffset = offset;

var generateMessageID = () => {
  var timeTicks = tsNow(),
      timeSec = Math.floor(timeTicks / 1000) + timerOffset,
      timeMSec = timeTicks % 1000,
      random = (0, _bin.nextRandomInt)(0xFFFF);

  var messageID = [timeSec, timeMSec << 21 | random << 3 | 4];
  if (lastMessageID[0] > messageID[0] || lastMessageID[0] == messageID[0] && lastMessageID[1] >= messageID[1]) {
    messageID = [lastMessageID[0], lastMessageID[1] + 4];
  }

  lastMessageID = messageID;

  // console.log('generated msg id', messageID, timerOffset)

  return (0, _bin.lshift32)(messageID[0], messageID[1]);
};

var applyServerTime = exports.applyServerTime = (serverTime, localTime) => {
  var newTimeOffset = serverTime - Math.floor((localTime || tsNow()) / 1000);
  var changed = Math.abs(timerOffset - newTimeOffset) > 10;
  _store.TimeOffset.set(newTimeOffset);

  lastMessageID = [0, 0];
  timerOffset = newTimeOffset;
  log('Apply server time')(serverTime, localTime, newTimeOffset, changed);

  return changed;
};

exports.generateID = generateMessageID;
//# sourceMappingURL=time-manager.js.map