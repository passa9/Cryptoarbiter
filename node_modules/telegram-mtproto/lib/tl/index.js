'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TypeWriter = exports.TL = exports.Deserialization = exports.Serialization = undefined;

var _mediator = require('./mediator');

Object.keys(_mediator).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _mediator[key];
    }
  });
});

var _typeBuffer = require('./type-buffer');

Object.defineProperty(exports, 'TypeWriter', {
  enumerable: true,
  get: function () {
    return _typeBuffer.TypeWriter;
  }
});

var _is = require('ramda/src/is');

var _is2 = _interopRequireDefault(_is);

var _has = require('ramda/src/has');

var _has2 = _interopRequireDefault(_has);

var _bin = require('../bin');

var _layout = require('../layout');

var _layout2 = _interopRequireDefault(_layout);

var _log = require('../util/log');

var _log2 = _interopRequireDefault(_log);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var debug = _log2.default`tl`;

var PACKED = 0x3072cfa1;

var apiLayer = void 0;
var mtLayer = void 0;

class Serialization {
  constructor({ mtproto, startMaxLength }, api, mtApi) {
    this.writer = new _typeBuffer.TypeWriter();

    this.api = api;
    this.mtApi = mtApi;

    this.writer.maxLength = startMaxLength;

    this.writer.reset();
    this.mtproto = mtproto;
    if (!apiLayer) apiLayer = new _layout2.default(api);
    if (!mtLayer) mtLayer = new _layout2.default(mtApi);
  }

  getBytes(typed) {
    if (typed) return this.writer.getBytesTyped();else return this.writer.getBytesPlain();
  }

  storeMethod(methodName, params) {
    var layer = this.mtproto ? mtLayer : apiLayer;
    var pred = layer.funcs.get(methodName);
    if (!pred) throw new Error(`No method name ${methodName} found`);

    _mediator.WriteMediator.int(this.writer, (0, _bin.intToUint)(`${pred.id}`), `${methodName}[id]`);
    if (pred.hasFlags) {
      var flags = (0, _layout.getFlags)(pred)(params);
      this.storeObject(flags, '#', `f ${methodName} #flags ${flags}`);
    }
    for (var _iterator = pred.params, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
      var _ref;

      if (_isArray) {
        if (_i >= _iterator.length) break;
        _ref = _iterator[_i++];
      } else {
        _i = _iterator.next();
        if (_i.done) break;
        _ref = _i.value;
      }

      var param = _ref;

      var paramName = param.name;
      var typeClass = param.typeClass;
      var fieldObj = void 0;
      if (!(0, _has2.default)(paramName, params)) {
        if (param.isFlag) continue;else if (layer.typeDefaults.has(typeClass)) fieldObj = layer.typeDefaults.get(typeClass);else if ((0, _layout.isSimpleType)(typeClass)) {
          switch (typeClass) {
            case 'int':
              fieldObj = 0;break;
            // case 'long': fieldObj = 0; break
            case 'string':
              fieldObj = ' ';break;
            // case 'double': fieldObj = 0; break
            case 'true':
              fieldObj = true;break;
            // case 'bytes': fieldObj = [0]; break
          }
        } else throw new Error(`Method ${methodName} did not receive required argument ${paramName}`);
      } else {
        fieldObj = params[paramName];
      }
      if (param.isVector) {
        if (!Array.isArray(fieldObj)) throw new TypeError(`Vector argument ${paramName} in ${methodName} required Array,` +
        //$FlowIssue
        ` got ${fieldObj} ${typeof fieldObj}`);
        _mediator.WriteMediator.int(this.writer, 0x1cb5c415, `${paramName}[id]`);
        _mediator.WriteMediator.int(this.writer, fieldObj.length, `${paramName}[count]`);
        for (var _iterator2 = fieldObj.entries(), _isArray2 = Array.isArray(_iterator2), _i2 = 0, _iterator2 = _isArray2 ? _iterator2 : _iterator2[Symbol.iterator]();;) {
          var _ref2;

          if (_isArray2) {
            if (_i2 >= _iterator2.length) break;
            _ref2 = _iterator2[_i2++];
          } else {
            _i2 = _iterator2.next();
            if (_i2.done) break;
            _ref2 = _i2.value;
          }

          var [i, elem] = _ref2;

          this.storeObject(elem, param.typeClass, `${paramName}[${i}]`);
        }
      } else this.storeObject(fieldObj, param.typeClass, `f ${methodName}(${paramName})`);
    }
    /*let condType
    let fieldBit
    for (const param of methodData.params) {
      let type = param.type
      if (type.indexOf('?') !== -1) {
        condType = type.split('?')
        fieldBit = condType[0].split('.')
        if (!(params[fieldBit[0]] & 1 << fieldBit[1])) {
          continue
        }
        type = condType[1]
      }
      const paramName = param.name
      const stored = params[paramName]
      if (!stored)
        stored = this.emptyOfType(type, schema)
      if (!stored)
        throw new Error(`Method ${methodName}.`+
          ` No value of field ${ param.name } recieved and no Empty of type ${ param.type }`)
      this.storeObject(stored, type, `f ${methodName}(${paramName})`)
    }*/

    return pred.returns;
  }
  /*emptyOfType(ofType, schema: TLSchema) {
    const resultConstruct = schema.constructors.find(
      ({ type, predicate }: TLConstruct) =>
        type === ofType &&
        predicate.indexOf('Empty') !== -1)
    return resultConstruct
      ? { _: resultConstruct.predicate }
      : null
  }*/
  storeObject(obj, type, field) {
    switch (type) {
      case '#':
      case 'int':
        return _mediator.WriteMediator.int(this.writer, obj, field);
      case 'long':
        return _mediator.WriteMediator.long(this.writer, obj, field);
      case 'int128':
        return _mediator.WriteMediator.intBytes(this.writer, obj, 128, field);
      case 'int256':
        return _mediator.WriteMediator.intBytes(this.writer, obj, 256, field);
      case 'int512':
        return _mediator.WriteMediator.intBytes(this.writer, obj, 512, field);
      case 'string':
        return _mediator.WriteMediator.bytes(this.writer, obj, `${field}:string`);
      case 'bytes':
        return _mediator.WriteMediator.bytes(this.writer, obj, field);
      case 'double':
        return _mediator.WriteMediator.double(this.writer, obj, field);
      case 'Bool':
        return _mediator.WriteMediator.bool(this.writer, obj, field);
      case 'true':
        return;
    }

    if (Array.isArray(obj)) {
      if (type.substr(0, 6) == 'Vector') _mediator.WriteMediator.int(this.writer, 0x1cb5c415, `${field}[id]`);else if (type.substr(0, 6) != 'vector') {
        throw new Error(`Invalid vector type ${type}`);
      }
      var itemType = type.substr(7, type.length - 8); // for "Vector<itemType>"
      _mediator.WriteMediator.int(this.writer, obj.length, `${field}[count]`);
      for (var i = 0; i < obj.length; i++) {
        this.storeObject(obj[i], itemType, `${field}[${i}]`);
      }
      return true;
    } else if (type.substr(0, 6).toLowerCase() == 'vector') {
      throw new Error('Invalid vector object');
    }

    if (!(0, _is2.default)(Object, obj)) throw new Error(`Invalid object for type ${type}`);

    var schema = selectSchema(this.mtproto, this.api, this.mtApi);

    var predicate = obj['_'];
    var isBare = false;
    var constructorData = false;
    isBare = type.charAt(0) == '%';
    if (isBare) type = type.substr(1);

    for (var _iterator3 = schema.constructors, _isArray3 = Array.isArray(_iterator3), _i3 = 0, _iterator3 = _isArray3 ? _iterator3 : _iterator3[Symbol.iterator]();;) {
      var _ref3;

      if (_isArray3) {
        if (_i3 >= _iterator3.length) break;
        _ref3 = _iterator3[_i3++];
      } else {
        _i3 = _iterator3.next();
        if (_i3.done) break;
        _ref3 = _i3.value;
      }

      var tlConst = _ref3;

      if (tlConst.predicate == predicate) {
        constructorData = tlConst;
        break;
      }
    }

    if (!constructorData) throw new Error(`No predicate ${predicate} found`);

    if (predicate == type) isBare = true;

    if (!isBare) _mediator.WriteMediator.int(this.writer, (0, _bin.intToUint)(constructorData.id), `${field}.${predicate}[id]`);

    var condType = void 0;
    var fieldBit = void 0;

    for (var _iterator4 = constructorData.params, _isArray4 = Array.isArray(_iterator4), _i4 = 0, _iterator4 = _isArray4 ? _iterator4 : _iterator4[Symbol.iterator]();;) {
      var _ref4;

      if (_isArray4) {
        if (_i4 >= _iterator4.length) break;
        _ref4 = _iterator4[_i4++];
      } else {
        _i4 = _iterator4.next();
        if (_i4.done) break;
        _ref4 = _i4.value;
      }

      var param = _ref4;

      type = param.type;
      if (type.indexOf('?') !== -1) {
        condType = type.split('?');
        fieldBit = condType[0].split('.');
        if (!(obj[fieldBit[0]] & 1 << fieldBit[1])) {
          continue;
        }
        type = condType[1];
      }

      this.storeObject(obj[param.name], type, `${field}.${predicate}.${param.name}`);
    }

    return constructorData.type;
  }

}

exports.Serialization = Serialization;
class Deserialization {
  constructor(buffer, { mtproto, override }, api, mtApi) {
    this.readInt = field => {
      // log('int')(field, i.toString(16), i)
      return _mediator.ReadMediator.int(this.typeBuffer, field);
    };

    this.api = api;
    this.mtApi = mtApi;
    this.override = override;

    this.typeBuffer = new _typeBuffer.TypeBuffer(buffer);
    this.mtproto = mtproto;
  }

  fetchInt(field = '') {
    return this.readInt(`${field}:int`);
  }

  fetchBool(field = '') {
    var i = this.readInt(`${field}:bool`);
    switch (i) {
      case 0x997275b5:
        return true;
      case 0xbc799737:
        return false;
      default:
        {
          this.typeBuffer.offset -= 4;
          return this.fetchObject('Object', field);
        }
    }
  }
  fetchIntBytes(bits, field = '') {
    if (bits % 32) throw new Error(`Invalid bits: ${bits}`);

    var len = bits / 8;

    var bytes = this.typeBuffer.next(len);

    debug(`int bytes`)((0, _bin.bytesToHex)(bytes), `${field}:int${bits}`);

    return bytes;
  }

  fetchRawBytes(len, field = '') {
    if (len === false) {
      len = this.readInt(`${field}_length`);
      if (len > this.typeBuffer.byteView.byteLength) throw new Error(`Invalid raw bytes length: ${len}, buffer len: ${this.typeBuffer.byteView.byteLength}`);
    }
    var bytes = this.typeBuffer.next(len);
    debug(`raw bytes`)((0, _bin.bytesToHex)(bytes), field);

    return bytes;
  }

  fetchPacked(type, field = '') {
    var compressed = _mediator.ReadMediator.bytes(this.typeBuffer, `${field}[packed_string]`);
    var uncompressed = (0, _bin.gzipUncompress)(compressed);
    var buffer = (0, _bin.bytesToArrayBuffer)(uncompressed);
    var newDeserializer = new Deserialization(buffer, {
      mtproto: this.mtproto,
      override: this.override
    }, this.api, this.mtApi);

    return newDeserializer.fetchObject(type, field);
  }

  fetchVector(type, field = '') {
    var typeProps = (0, _layout.getTypeProps)(type);
    if (type.charAt(0) === 'V') {
      var _constructor = this.readInt(`${field}[id]`);
      var constructorCmp = (0, _bin.uintToInt)(_constructor);

      if (constructorCmp === PACKED) return this.fetchPacked(type, field);
      if (constructorCmp !== 0x1cb5c415) throw new Error(`Invalid vector constructor ${_constructor}`);
    }
    var len = this.readInt(`${field}[count]`);
    var result = [];
    if (len > 0) {
      var itemType = type.substr(7, type.length - 8); // for "Vector<itemType>"
      for (var i = 0; i < len; i++) {
        result.push(this.fetchObject(itemType, `${field}[${i}]`));
      }
    }

    return result;
  }

  fetchObject(type, field = '') {
    switch (type) {
      case '#':
      case 'int':
        return this.fetchInt(field);
      case 'long':
        return _mediator.ReadMediator.long(this.typeBuffer, field);
      case 'int128':
        return this.fetchIntBytes(128, field);
      case 'int256':
        return this.fetchIntBytes(256, field);
      case 'int512':
        return this.fetchIntBytes(512, field);
      case 'string':
        return _mediator.ReadMediator.string(this.typeBuffer, field);
      case 'bytes':
        return _mediator.ReadMediator.bytes(this.typeBuffer, field);
      case 'double':
        return _mediator.ReadMediator.double(this.typeBuffer, field);
      case 'Bool':
        return this.fetchBool(field);
      case 'true':
        return true;
    }
    var fallback = void 0;
    field = field || type || 'Object';

    // const layer = this.mtproto
    //   ? mtLayer
    //   : apiLayer
    var typeProps = (0, _layout.getTypeProps)(type);
    // layer.typesById

    if (typeProps.isVector) return this.fetchVector(type, field);

    var schema = selectSchema(this.mtproto, this.api, this.mtApi);
    var predicate = false;
    var constructorData = false;

    if (typeProps.isBare) constructorData = (0, _typeBuffer.getNakedType)(type, schema);else {
      var _constructor2 = this.readInt(`${field}[id]`);
      var constructorCmp = (0, _bin.uintToInt)(_constructor2);

      if (constructorCmp === PACKED) return this.fetchPacked(type, field);

      var index = schema.constructorsIndex;
      if (!index) {
        schema.constructorsIndex = index = {};
        for (var _i5 = 0; _i5 < schema.constructors.length; _i5++) {
          index[schema.constructors[_i5].id] = _i5;
        }
      }
      var i = index[constructorCmp];
      if (i) constructorData = schema.constructors[i];

      fallback = false;
      if (!constructorData && this.mtproto) {
        var schemaFallback = this.api;
        var finded = (0, _typeBuffer.getTypeConstruct)(constructorCmp, schemaFallback);
        if (finded) {
          constructorData = finded;
          delete this.mtproto;
          fallback = true;
        }
      }
      if (!constructorData) {
        throw new Error(`Constructor not found: ${_constructor2} ${this.fetchInt()} ${this.fetchInt()}`);
      }
    }

    predicate = constructorData.predicate;

    var result = { '_': predicate };
    var overrideKey = (this.mtproto ? 'mt_' : '') + predicate;

    if (this.override[overrideKey]) {
      this.override[overrideKey].apply(this, [result, `${field}[${predicate}]`]);
    } else {
      for (var _iterator5 = constructorData.params, _isArray5 = Array.isArray(_iterator5), _i6 = 0, _iterator5 = _isArray5 ? _iterator5 : _iterator5[Symbol.iterator]();;) {
        var _ref5;

        if (_isArray5) {
          if (_i6 >= _iterator5.length) break;
          _ref5 = _iterator5[_i6++];
        } else {
          _i6 = _iterator5.next();
          if (_i6.done) break;
          _ref5 = _i6.value;
        }

        var param = _ref5;

        type = param.type;
        // if (type === '#' && isNil(result.pFlags))
        //   result.pFlags = {}
        if (type.indexOf('?') !== -1) {
          var condType = type.split('?');
          var fieldBit = condType[0].split('.');
          if (!(result[fieldBit[0]] & 1 << fieldBit[1])) continue;
          type = condType[1];
        }
        var paramName = param.name;
        var value = this.fetchObject(type, `${field}[${predicate}][${paramName}]`);

        result[paramName] = value;
      }
    }

    if (fallback) this.mtproto = true;

    return result;
  }

  getOffset() {
    return this.typeBuffer.offset;
  }

  fetchEnd() {
    if (!this.typeBuffer.isEnd()) throw new Error('Fetch end with non-empty buffer');
    return true;
  }

}

exports.Deserialization = Deserialization;
var selectSchema = (mtproto, api, mtApi) => mtproto ? mtApi : api;

var TL = exports.TL = (api, mtApi) => ({
  Serialization: ({ mtproto = false, startMaxLength = 2048 /* 2Kb */ } = {}) => new Serialization({ mtproto, startMaxLength }, api, mtApi),
  Deserialization: (buffer, { mtproto = false, override = {} } = {}) => new Deserialization(buffer, { mtproto, override }, api, mtApi)
});

exports.default = TL;
//# sourceMappingURL=index.js.map