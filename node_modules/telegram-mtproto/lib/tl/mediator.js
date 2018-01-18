'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ReadMediator = exports.WriteMediator = undefined;

var _typeBuffer = require('./type-buffer');

var _bin = require('../bin');

var _log = require('../util/log');

var _log2 = _interopRequireDefault(_log);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var log = _log2.default`tl:mediator`;

var WriteMediator = exports.WriteMediator = {
  int(ctx, i, field = '') {
    ctx.writeInt(i, `${field}:int`);
  },
  bool(ctx, i, field = '') {
    if (i) {
      ctx.writeInt(0x997275b5, `${field}:bool`);
    } else {
      ctx.writeInt(0xbc799737, `${field}:bool`);
    }
  },
  longP(ctx, iHigh, iLow, field) {
    ctx.writePair(iLow, iHigh, `${field}:long[low]`, `${field}:long[high]`);
  },
  long(ctx, sLong, field = '') {
    if (Array.isArray(sLong)) return sLong.length === 2 ? this.longP(ctx, sLong[0], sLong[1], field) : this.intBytes(ctx, sLong, 64, field);
    var str = void 0;
    if (typeof sLong !== 'string') str = sLong ? sLong.toString() : '0';else str = sLong;
    var [int1, int2] = (0, _bin.longToInts)(str);
    ctx.writePair(int2, int1, `${field}:long[low]`, `${field}:long[high]`);
  },
  double(ctx, f, field = '') {
    var buffer = new ArrayBuffer(8);
    var intView = new Int32Array(buffer);
    var doubleView = new Float64Array(buffer);

    doubleView[0] = f;

    var [int1, int2] = intView;
    ctx.writePair(int2, int1, `${field}:double[low]`, `${field}:double[high]`);
  },
  bytes(ctx, bytes, field = '') {
    var { list, length } = binaryDataGuard(bytes);
    // this.debug && console.log('>>>', bytesToHex(bytes), `${ field }:bytes`)

    ctx.checkLength(length + 8);
    if (length <= 253) {
      ctx.next(length);
    } else {
      ctx.next(254);
      ctx.next(length & 0xFF);
      ctx.next((length & 0xFF00) >> 8);
      ctx.next((length & 0xFF0000) >> 16);
    }

    ctx.set(list, length);
    ctx.addPadding();
  },
  intBytes(ctx, bytes, bits, field = '') {
    var { list, length } = binaryDataGuard(bytes);

    if (bits) {
      if (bits % 32 || length * 8 != bits) {
        throw new Error(`Invalid bits: ${bits}, ${length}`);
      }
    }
    // this.debug && console.log('>>>', bytesToHex(bytes), `${ field }:int${  bits}`)
    ctx.checkLength(length);
    ctx.set(list, length);
  }
};

var ReadMediator = exports.ReadMediator = {
  int(ctx, field) {
    var result = ctx.nextInt();
    log('read, int')(field, result);
    return result;
  },
  long(ctx, field) {
    var iLow = this.int(ctx, `${field}:long[low]`);
    var iHigh = this.int(ctx, `${field}:long[high]`);

    var res = (0, _bin.lshift32)(iHigh, iLow);
    return res;
  },
  double(ctx, field) {
    var buffer = new ArrayBuffer(8);
    var intView = new Int32Array(buffer);
    var doubleView = new Float64Array(buffer);

    intView[0] = this.int(ctx, `${field}:double[low]`);
    intView[1] = this.int(ctx, `${field}:double[high]`);

    return doubleView[0];
  },
  string(ctx, field) {
    var bytes = this.bytes(ctx, `${field}:string`);
    var sUTF8 = [...bytes].map(getChar).join('');

    var s = void 0;
    try {
      s = decodeURIComponent(escape(sUTF8));
    } catch (e) {
      s = sUTF8;
    }

    log(`read, string`)(s, `${field}:string`);

    return s;
  },
  bytes(ctx, field) {
    var len = ctx.nextByte();

    if (len == 254) {
      len = ctx.nextByte() | ctx.nextByte() << 8 | ctx.nextByte() << 16;
    }

    var bytes = ctx.next(len);
    ctx.addPadding();

    log(`read, bytes`)((0, _bin.bytesToHex)(bytes), `${field}:bytes`);

    return bytes;
  }
};

var binaryDataGuard = bytes => {
  var list = void 0,
      length = void 0;
  if (bytes instanceof ArrayBuffer) {
    list = new Uint8Array(bytes);
    length = bytes.byteLength;
  } else if (typeof bytes === 'string') {
    list = (0, _bin.stringToChars)(unescape(encodeURIComponent(bytes)));
    length = list.length;
  } else if (bytes === undefined) {
    list = [];
    length = 0;
  } else {
    list = bytes;
    length = bytes.length;
  }
  return {
    list,
    length
  };
};

var getChar = e => String.fromCharCode(e);
//# sourceMappingURL=mediator.js.map