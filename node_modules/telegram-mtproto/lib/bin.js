'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.rshift32 = exports.strDecToHex = undefined;
exports.stringToChars = stringToChars;
exports.bytesToHex = bytesToHex;
exports.bytesFromHex = bytesFromHex;
exports.bytesCmp = bytesCmp;
exports.bytesXor = bytesXor;
exports.bytesToWords = bytesToWords;
exports.bytesFromWords = bytesFromWords;
exports.bytesFromLeemonBigInt = bytesFromLeemonBigInt;
exports.bytesToArrayBuffer = bytesToArrayBuffer;
exports.convertToArrayBuffer = convertToArrayBuffer;
exports.convertToUint8Array = convertToUint8Array;
exports.convertToByteArray = convertToByteArray;
exports.bytesFromArrayBuffer = bytesFromArrayBuffer;
exports.bufferConcat = bufferConcat;
exports.longToInts = longToInts;
exports.longToBytes = longToBytes;
exports.lshift32 = lshift32;
exports.intToUint = intToUint;
exports.uintToInt = uintToInt;
exports.sha1HashSync = sha1HashSync;
exports.sha1BytesSync = sha1BytesSync;
exports.sha256HashSync = sha256HashSync;
exports.rsaEncrypt = rsaEncrypt;
exports.addPadding = addPadding;
exports.aesEncryptSync = aesEncryptSync;
exports.aesDecryptSync = aesDecryptSync;
exports.gzipUncompress = gzipUncompress;
exports.nextRandomInt = nextRandomInt;
exports.pqPrimeFactorization = pqPrimeFactorization;
exports.pqPrimeLeemon = pqPrimeLeemon;
exports.bytesModPow = bytesModPow;

var _toLower = require('ramda/src/toLower');

var _toLower2 = _interopRequireDefault(_toLower);

var _rusha = require('rusha');

var _rusha2 = _interopRequireDefault(_rusha);

var _nodeCryptojsAes = require('@goodmind/node-cryptojs-aes');

var CryptoJSlib = _interopRequireWildcard(_nodeCryptojsAes);

var _inflate = require('pako/lib/inflate');

var _secureRandom = require('./service/secure-random');

var _secureRandom2 = _interopRequireDefault(_secureRandom);

var _leemon = require('./vendor/leemon');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var { CryptoJS } = CryptoJSlib;


var rushaInstance = new _rusha2.default(1024 * 1024);

function stringToChars(str) {
  var ln = str.length;
  var result = Array(ln);
  for (var i = 0; i < ln; ++i) {
    result[i] = str.charCodeAt(i);
  }return result;
}

var strDecToHex = exports.strDecToHex = str => (0, _toLower2.default)((0, _leemon.bigInt2str)((0, _leemon.str2bigInt)(str, 10, 0), 16));

function bytesToHex(bytes = []) {
  var arr = [];
  for (var i = 0; i < bytes.length; i++) {
    arr.push((bytes[i] < 16 ? '0' : '') + (bytes[i] || 0).toString(16));
  }
  return arr.join('');
}

function bytesFromHex(hexString) {
  var len = hexString.length;
  var start = 0;
  var bytes = [];

  if (hexString.length % 2) {
    bytes.push(parseInt(hexString.charAt(0), 16));
    start++;
  }

  for (var i = start; i < len; i += 2) {
    bytes.push(parseInt(hexString.substr(i, 2), 16));
  }

  return bytes;
}

function bytesCmp(bytes1, bytes2) {
  var len = bytes1.length;
  if (len !== bytes2.length) {
    return false;
  }

  for (var i = 0; i < len; i++) {
    if (bytes1[i] !== bytes2[i]) return false;
  }
  return true;
}

function bytesXor(bytes1, bytes2) {
  var len = bytes1.length;
  var bytes = [];

  for (var i = 0; i < len; ++i) {
    bytes[i] = bytes1[i] ^ bytes2[i];
  }

  return bytes;
}

function bytesToWords(bytes) {
  if (bytes instanceof ArrayBuffer) {
    bytes = new Uint8Array(bytes);
  }
  var len = bytes.length;
  var words = [];
  var i = void 0;
  for (i = 0; i < len; i++) {
    words[i >>> 2] |= bytes[i] << 24 - i % 4 * 8;
  }

  return new CryptoJS.lib.WordArray.init(words, len);
}

function bytesFromWords(wordArray) {
  var words = wordArray.words;
  var sigBytes = wordArray.sigBytes;
  var bytes = [];

  for (var i = 0; i < sigBytes; i++) {
    bytes.push(words[i >>> 2] >>> 24 - i % 4 * 8 & 0xff);
  }

  return bytes;
}

function bytesFromLeemonBigInt(bigInt) {
  var str = (0, _leemon.bigInt2str)(bigInt, 16);
  return bytesFromHex(str);
}

function bytesToArrayBuffer(b) {
  return new Uint8Array(b).buffer;
}

function convertToArrayBuffer(bytes) {
  // Be careful with converting subarrays!!
  if (bytes instanceof ArrayBuffer) {
    return bytes;
  }
  if (bytes.buffer !== undefined && bytes.buffer.byteLength == bytes.length * bytes.BYTES_PER_ELEMENT) {
    return bytes.buffer;
  }
  return bytesToArrayBuffer(bytes);
}

function convertToUint8Array(bytes) {
  if (bytes.buffer !== undefined) return bytes;
  return new Uint8Array(bytes);
}

function convertToByteArray(bytes) {
  if (Array.isArray(bytes)) return bytes;
  bytes = convertToUint8Array(bytes);
  var newBytes = [];
  for (var i = 0, len = bytes.length; i < len; i++) {
    newBytes.push(bytes[i]);
  }return newBytes;
}

function bytesFromArrayBuffer(buffer) {
  var byteView = new Uint8Array(buffer);
  var bytes = Array.from(byteView);
  return bytes;
}

function bufferConcat(buffer1, buffer2) {
  var l1 = buffer1.byteLength || buffer1.length;
  var l2 = buffer2.byteLength || buffer2.length;
  var tmp = new Uint8Array(l1 + l2);
  tmp.set(buffer1 instanceof ArrayBuffer ? new Uint8Array(buffer1) : buffer1, 0);
  tmp.set(buffer2 instanceof ArrayBuffer ? new Uint8Array(buffer2) : buffer2, l1);

  return tmp.buffer;
}

// const dividerBig = bigint(0x100000000)
var dividerLem = (0, _leemon.str2bigInt)('100000000', 16, 4);

// const printTimers = (timeL, timeB, a, b, n) => setTimeout(
//   () => console.log(`Timer L ${timeL} B ${timeB}`, ...a, ...b, n || ''),
//   100)

function longToInts(sLong) {
  var lemNum = (0, _leemon.str2bigInt)(sLong, 10, 6);
  var div = new Array(lemNum.length);
  var rem = new Array(lemNum.length);
  (0, _leemon.divide_)(lemNum, dividerLem, div, rem);
  var resL = [~~(0, _leemon.bigInt2str)(div, 10), ~~(0, _leemon.bigInt2str)(rem, 10)];
  return resL;
}

function longToBytes(sLong) {
  return bytesFromWords({ words: longToInts(sLong), sigBytes: 8 }).reverse();
}

function lshift32(high, low) {
  var highNum = (0, _leemon.str2bigInt)(high.toString(), 10, 6);
  var nLow = (0, _leemon.str2bigInt)(low.toString(), 10, 6);
  (0, _leemon.leftShift_)(highNum, 32);

  (0, _leemon.add_)(highNum, nLow);
  var res = (0, _leemon.bigInt2str)(highNum, 10);
  return res;
}

var rshift32 = exports.rshift32 = str => {
  var num = (0, _leemon.str2bigInt)(str, 10, 6);
  (0, _leemon.rightShift_)(num, 32);
  return (0, _leemon.bigInt2str)(num, 10);
};

function intToUint(val) {
  var result = ~~val;
  if (result < 0) result = result + 0x100000000;
  return result;
}

var middle = 0x100000000 / 2 - 1;

function uintToInt(val) {
  if (val > middle) val = val - 0x100000000;
  return val;
}

function sha1HashSync(bytes) {
  // console.log(dT(), 'SHA-1 hash start', bytes.byteLength || bytes.length)
  var hashBytes = rushaInstance.rawDigest(bytes).buffer;
  // console.log(dT(), 'SHA-1 hash finish')

  return hashBytes;
}

function sha1BytesSync(bytes) {
  return bytesFromArrayBuffer(sha1HashSync(bytes));
}

function sha256HashSync(bytes) {
  // console.log(dT(), 'SHA-2 hash start', bytes.byteLength || bytes.length)
  var hashWords = CryptoJS.SHA256(bytesToWords(bytes));
  // console.log(dT(), 'SHA-2 hash finish')

  var hashBytes = bytesFromWords(hashWords);

  return hashBytes;
}

function rsaEncrypt(publicKey, bytes) {
  bytes = addPadding(bytes, 255);

  var N = (0, _leemon.str2bigInt)(publicKey.modulus, 16, 256);
  var E = (0, _leemon.str2bigInt)(publicKey.exponent, 16, 256);
  var X = (0, _leemon.str2bigInt)(bytesToHex(bytes), 16, 256);
  var encryptedBigInt = (0, _leemon.powMod)(X, E, N),
      encryptedBytes = bytesFromHex((0, _leemon.bigInt2str)(encryptedBigInt, 16));

  return encryptedBytes;
}

function addPadding(bytes, blockSize, zeroes) {
  blockSize = blockSize || 16;
  var len = bytes.byteLength || bytes.length;
  var needPadding = blockSize - len % blockSize;
  if (needPadding > 0 && needPadding < blockSize) {
    var padding = new Array(needPadding);
    if (zeroes) {
      for (var i = 0; i < needPadding; i++) {
        padding[i] = 0;
      }
    } else (0, _secureRandom2.default)(padding);

    bytes = bytes instanceof ArrayBuffer ? bufferConcat(bytes, padding) : bytes.concat(padding);
  }

  return bytes;
}

function aesEncryptSync(bytes, keyBytes, ivBytes) {
  // console.log(dT(), 'AES encrypt start', len/*, bytesToHex(keyBytes), bytesToHex(ivBytes)*/)
  bytes = addPadding(bytes);

  var encryptedWords = CryptoJS.AES.encrypt(bytesToWords(bytes), bytesToWords(keyBytes), {
    iv: bytesToWords(ivBytes),
    padding: CryptoJS.pad.NoPadding,
    mode: CryptoJS.mode.IGE
  }).ciphertext;

  var encryptedBytes = bytesFromWords(encryptedWords);
  // console.log(dT(), 'AES encrypt finish')

  return encryptedBytes;
}

function aesDecryptSync(encryptedBytes, keyBytes, ivBytes) {

  // console.log(dT(), 'AES decrypt start', encryptedBytes.length)
  var decryptedWords = CryptoJS.AES.decrypt({ ciphertext: bytesToWords(encryptedBytes) }, bytesToWords(keyBytes), {
    iv: bytesToWords(ivBytes),
    padding: CryptoJS.pad.NoPadding,
    mode: CryptoJS.mode.IGE
  });

  var bytes = bytesFromWords(decryptedWords);
  // console.log(dT(), 'AES decrypt finish')

  return bytes;
}

function gzipUncompress(bytes) {
  // console.log('Gzip uncompress start')
  var result = (0, _inflate.inflate)(bytes);
  // console.log('Gzip uncompress finish')
  return result;
}

function nextRandomInt(maxValue) {
  return Math.floor(Math.random() * maxValue);
}

function pqPrimeFactorization(pqBytes) {
  var minSize = Math.ceil(64 / _leemon.bpe) + 1;

  // const what = new BigInteger(pqBytes)
  var hex = bytesToHex(pqBytes);
  var lWhat = (0, _leemon.str2bigInt)(hex, 16, minSize);
  var result = pqPrimeLeemon(lWhat);
  return result;
}

function pqPrimeLeemon(what) {
  var minBits = 64;
  var minLen = Math.ceil(minBits / _leemon.bpe) + 1;
  var it = 0;
  var q = void 0,
      lim = void 0;
  var a = new Array(minLen);
  var b = new Array(minLen);
  var c = new Array(minLen);
  var g = new Array(minLen);
  var z = new Array(minLen);
  var x = new Array(minLen);
  var y = new Array(minLen);

  for (var i = 0; i < 3; i++) {
    q = (nextRandomInt(128) & 15) + 17;
    (0, _leemon.copyInt_)(x, nextRandomInt(1000000000) + 1);
    (0, _leemon.copy_)(y, x);
    lim = 1 << i + 18;

    for (var j = 1; j < lim; j++) {
      ++it;
      (0, _leemon.copy_)(a, x);
      (0, _leemon.copy_)(b, x);
      (0, _leemon.copyInt_)(c, q);

      while (!(0, _leemon.isZero)(b)) {
        if (b[0] & 1) {
          (0, _leemon.add_)(c, a);
          if ((0, _leemon.greater)(c, what)) {
            (0, _leemon.sub_)(c, what);
          }
        }
        (0, _leemon.add_)(a, a);
        if ((0, _leemon.greater)(a, what)) {
          (0, _leemon.sub_)(a, what);
        }
        (0, _leemon.rightShift_)(b, 1);
      }

      (0, _leemon.copy_)(x, c);
      if ((0, _leemon.greater)(x, y)) {
        (0, _leemon.copy_)(z, x);
        (0, _leemon.sub_)(z, y);
      } else {
        (0, _leemon.copy_)(z, y);
        (0, _leemon.sub_)(z, x);
      }
      (0, _leemon.eGCD_)(z, what, g, a, b);
      if (!(0, _leemon.equalsInt)(g, 1)) {
        break;
      }
      if ((j & j - 1) === 0) {
        (0, _leemon.copy_)(y, x);
      }
    }
    if ((0, _leemon.greater)(g, _leemon.one)) {
      break;
    }
  }

  (0, _leemon.divide_)(what, g, x, y);

  var [P, Q] = (0, _leemon.greater)(g, x) ? [x, g] : [g, x];

  // console.log(dT(), 'done', bigInt2str(what, 10), bigInt2str(P, 10), bigInt2str(Q, 10))

  return [bytesFromLeemonBigInt(P), bytesFromLeemonBigInt(Q), it];
}

function bytesModPow(x, y, m) {
  var xBigInt = (0, _leemon.str2bigInt)(bytesToHex(x), 16);
  var yBigInt = (0, _leemon.str2bigInt)(bytesToHex(y), 16);
  var mBigInt = (0, _leemon.str2bigInt)(bytesToHex(m), 16);
  var resBigInt = (0, _leemon.powMod)(xBigInt, yBigInt, mBigInt);

  return bytesFromHex((0, _leemon.bigInt2str)(resBigInt, 16));
}
//# sourceMappingURL=bin.js.map