
/**
 * Module dependencies.
 */

import { v4 as uuid } from 'node-uuid';

/**
 * Request id middleware.
 */

export default function(options) {
  options = Object.assign({
    expose: 'Request-Id',
    header: 'Request-Id',
    query: 'requestId'
  }, options);

  const keys = Object.keys(options);

  for (let i = 0; i < keys.length; i++) {
    if (typeof options[keys[i]] !== 'boolean' && typeof options[keys[i]] !== 'string') {
      throw new Error(`Option \`${keys[i]}\` requires a boolean or a string`);
    }
  }

  return function *requestId(next) {
    let id;

    if (options.query) {
      id = this.query[options.query];
    }

    if (!id && options.header) {
      id = this.get(options.header);
    }

    if (!id) {
      id = uuid();
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
}
