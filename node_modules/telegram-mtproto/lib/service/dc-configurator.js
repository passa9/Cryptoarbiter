'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.chooseServer = undefined;

var _has = require('ramda/src/has');

var _has2 = _interopRequireDefault(_has);

var _propEq = require('ramda/src/propEq');

var _propEq2 = _interopRequireDefault(_propEq);

var _find = require('ramda/src/find');

var _find2 = _interopRequireDefault(_find);

var _pipe = require('ramda/src/pipe');

var _pipe2 = _interopRequireDefault(_pipe);

var _prop = require('ramda/src/prop');

var _prop2 = _interopRequireDefault(_prop);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var sslSubdomains = ['pluto', 'venus', 'aurora', 'vesta', 'flora'];

var devDC = [{ id: 1, host: '149.154.175.10', port: 80 }, { id: 2, host: '149.154.167.40', port: 80 }, { id: 3, host: '149.154.175.117', port: 80 }];

var prodDC = [{ id: 1, host: '149.154.175.50', port: 80 }, { id: 2, host: '149.154.167.51', port: 80 }, { id: 3, host: '149.154.175.100', port: 80 }, { id: 4, host: '149.154.167.91', port: 80 }, { id: 5, host: '149.154.171.5', port: 80 }];

var portString = ({ port = 80 }) => port === 80 ? '' : `:${port}`;

var findById = (0, _pipe2.default)((0, _propEq2.default)('id'), _find2.default);

var chooseServer = exports.chooseServer = (chosenServers, {
  dev = false,
  webogram = false,
  dcList = dev ? devDC : prodDC
} = {}) => (dcID, upload = false) => {
  var choosen = (0, _prop2.default)(dcID);
  if ((0, _has2.default)(dcID, chosenServers)) return choosen(chosenServers);
  var chosenServer = false;

  if (webogram) {
    var subdomain = sslSubdomains[dcID - 1] + (upload ? '-1' : '');
    var path = dev ? 'apiw_test1' : 'apiw1';
    chosenServer = `https://${subdomain}.web.telegram.org/${path}`;
    return chosenServer; //TODO Possibly bug. Isn't it necessary? chosenServers[dcID] = chosenServer
  }
  var dcOption = findById(dcID)(dcList);
  if (dcOption) chosenServer = `http://${dcOption.host}${portString(dcOption)}/apiw1`;
  chosenServers[dcID] = chosenServer;

  return choosen(chosenServers);
};
//# sourceMappingURL=dc-configurator.js.map