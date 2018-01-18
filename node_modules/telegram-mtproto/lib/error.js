'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
class MTError extends Error {
  static getMessage(code, type, message) {
    return `MT[${code}] ${type}: ${message}`;
  }

  constructor(code, type, message) {
    var fullMessage = MTError.getMessage(code, type, message);
    super(fullMessage);
    this.code = code;
    this.type = type;
  }
}

exports.MTError = MTError;
class ErrorBadResponse extends MTError {
  constructor(url, originalError = null) {
    super(406, 'NETWORK_BAD_RESPONSE', url);
    if (originalError) this.originalError = originalError;
  }
}

exports.ErrorBadResponse = ErrorBadResponse;
class ErrorBadRequest extends MTError {
  constructor(url, originalError = null) {
    super(406, 'NETWORK_BAD_REQUEST', url);
    if (originalError) this.originalError = originalError;
  }
}

exports.ErrorBadRequest = ErrorBadRequest;
class ErrorNotFound extends MTError {
  constructor(err) {
    super(404, 'REQUEST_FAILED', err.config.url);
    // this.originalError = err
  }
}

exports.ErrorNotFound = ErrorNotFound;
class TypeBufferIntError extends MTError {
  static getTypeBufferMessage(ctx) {
    var offset = ctx.offset;
    var length = ctx.intView.length * 4;
    return `Can not get next int: offset ${offset} length: ${length}`;
  }

  constructor(ctx) {
    var message = TypeBufferIntError.getTypeBufferMessage(ctx);
    super(800, 'NO_NEXT_INT', message);
    this.typeBuffer = ctx;
  }
}

exports.TypeBufferIntError = TypeBufferIntError;
class AuthKeyError extends MTError {
  constructor() {
    super(401, 'AUTH_KEY_EMPTY', '');
  }
}
exports.AuthKeyError = AuthKeyError;
//# sourceMappingURL=error.js.map