'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PureStorage = exports.AsyncStorage = exports.dcList = exports.TimeOffset = exports.ValueStoreMap = exports.ValueStore = undefined;

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _clone = require('ramda/src/clone');

var _clone2 = _interopRequireDefault(_clone);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ValueStore = exports.ValueStore = () => {
  var val = null;

  return {
    get: () => (0, _clone2.default)(val),
    set: newVal => val = newVal
  };
};

var ValueStoreMap = exports.ValueStoreMap = () => {
  var val = new Map();

  return {
    get: key => (0, _clone2.default)(val.get(key)),
    set: (key, newVal) => val.set(key, newVal)
  };
};

var TimeOffset = exports.TimeOffset = ValueStore();
var dcList = exports.dcList = ValueStoreMap();

function _ref2() {
  return {};
}

var AsyncStorage = exports.AsyncStorage = () => {
  var store = new Map();

  var get = key => store.get(key);
  var set = (key, val) => store.set(key, val);

  function _ref(e) {
    return store.delete(e);
  }

  var remove = keys => keys.map(_ref);
  var clr = () => store.clear();
  return {
    get: key => _bluebird2.default.resolve(get(key)),
    set: (key, val) => _bluebird2.default.resolve(set(key, val)),
    remove: (...keys) => _bluebird2.default.resolve(remove(keys)),
    clear: () => _bluebird2.default.resolve(clr()),
    noPrefix: _ref2,
    store
  };
};

var PureStorage = exports.PureStorage = AsyncStorage(); /*{
                                                        get     : (...keys) => new Promise(rs => ConfigStorage.get(keys, rs)),
                                                        set     : obj => new Promise(rs => ConfigStorage.set(obj, rs)),
                                                        remove  : (...keys) => new Promise(rs => ConfigStorage.remove(...keys, rs)),
                                                        noPrefix: () => ConfigStorage.noPrefix(),
                                                        clear   : () => new Promise(rs => ConfigStorage.clear(rs))
                                                        }*/
//# sourceMappingURL=store.js.map