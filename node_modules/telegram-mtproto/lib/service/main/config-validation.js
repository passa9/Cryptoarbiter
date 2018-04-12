'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _ajv = require('ajv');

var _ajv2 = _interopRequireDefault(_ajv);

var _typeof = require('ajv-keywords/keywords/typeof');

var _typeof2 = _interopRequireDefault(_typeof);

var _propIs = require('ramda/src/propIs');

var _propIs2 = _interopRequireDefault(_propIs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var type = {
  func: { typeof: 'function' },
  num: { type: 'number' },
  str: { type: 'string' },
  bool: { type: 'boolean' },
  obj: { type: 'object' }
};

var app = {
  type: 'object',
  properties: {
    publicKeys: {
      type: 'array',
      uniqueItems: true
    },
    storage: {
      type: 'object',
      required: ['get', 'set', 'remove', 'clear'],
      properties: {
        get: type.func,
        set: type.func,
        remove: type.func,
        clear: type.func
      },
      additionalProperties: true
    }
  },
  additionalProperties: false
};

var api = {
  type: 'object',
  required: ['layer', 'api_id'],
  properties: {
    invokeWithLayer: type.num,
    layer: type.num,
    initConnection: type.num,
    api_id: type.num,
    device_model: type.str,
    system_version: type.str,
    app_version: type.str,
    lang_code: type.str
  },
  additionalProperties: false
};

var dc = {
  type: 'object',
  required: ['id', 'host'],
  properties: {
    id: type.num,
    host: type.str,
    port: type.num
  },
  additionalProperties: false
};

var server = {
  type: 'object',
  properties: {
    dev: type.bool,
    webogram: type.bool,
    dcList: {
      type: 'array',
      uniqueItems: true,
      items: dc
    }
  },
  additionalProperties: false
};

var schema = {
  properties: {
    app,
    api,
    server,
    schema: type.obj,
    mtSchema: type.obj
  },
  additionalProperties: false
};

var ajv = new _ajv2.default();
(0, _typeof2.default)(ajv);
var validate = ajv.compile(schema);

var configValidator = config => {
  var valid = validate(config);
  if (!valid) {
    console.log('config errors');
    validate.errors.map(printObj);
    throw new Error('wrong config fields');
  }
};

var canDir = (0, _propIs2.default)(Function, 'dir', console);
var printObj = canDir ? arg => console.dir(arg, { colors: true }) : arg => console.log(arg);

exports.default = configValidator;
//# sourceMappingURL=config-validation.js.map