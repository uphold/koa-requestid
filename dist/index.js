
/**
 * Module dependencies.
 */

'use strict';

exports.__esModule = true;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _nodeUuid = require('node-uuid');

/**
 * Request id middleware.
 */

exports['default'] = function (options) {
  options = _extends({
    expose: 'Request-Id',
    header: 'Request-Id',
    query: 'requestId'
  }, options);

  var keys = Object.keys(options);

  for (var i = 0; i < keys.length; i++) {
    if (typeof options[keys[i]] !== 'boolean' && typeof options[keys[i]] !== 'string') {
      throw new Error('Option `' + keys[i] + '` requires a boolean or a string');
    }
  }

  return function* requestId(next) {
    var id = undefined;

    if (options.query) {
      id = this.query[options.query];
    }

    if (!id && options.header) {
      id = this.get(options.header);
    }

    if (!id) {
      id = _nodeUuid.v4();
    }

    if (options.expose) {
      this.set(options.expose, id);
    }

    if (this.state) {
      this.state.id = id;
    } else {
      this.id = id;
    }

    yield next;
  };
};

module.exports = exports['default'];