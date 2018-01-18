"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var logTimer = new Date().getTime();

var dTime = exports.dTime = () => `[${((new Date().getTime() - logTimer) / 1000).toFixed(3)}]`;

exports.default = dTime;
//# sourceMappingURL=dtime.js.map