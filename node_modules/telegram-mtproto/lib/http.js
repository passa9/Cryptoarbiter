'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.httpClient = undefined;

var _axios = require('axios');

var _axios2 = _interopRequireDefault(_axios);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var httpClient = exports.httpClient = _axios2.default.create();
delete httpClient.defaults.headers.post['Content-Type'];
delete httpClient.defaults.headers.common['Accept'];

exports.default = httpClient;
//# sourceMappingURL=http.js.map