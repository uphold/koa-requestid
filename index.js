'use strict';

/**
 * Module dependencies.
 */

const { randomUUID: uuid } = require('node:crypto');

/**
 * Bounds for client-supplied request ids.
 *
 * The id is echoed back in a response header and stored in `ctx.state.id`,
 * where downstream code (loggers, error trackers, database columns) expects a
 * sane string. Node rejects control characters and code points above U+00FF
 * in `res.setHeader` with `ERR_INVALID_CHAR`, so an unsanitized id taken from
 * the query string (e.g. `?requestId=%0d%0aX-Injected:%20yes`) used to crash
 * the request with an uncaught `TypeError` and a 500 response. Repeated query
 * parameters also parse into an array, which would leak a non-string into
 * `ctx.state.id`, and unbounded ids are echoed back verbatim. Ids outside
 * these bounds are ignored and replaced by a freshly generated uuid.
 */

const MAX_ID_LENGTH = 255;

/**
 * Header field name grammar (`token` in RFC 7230).
 *
 * `expose` and `header` are used verbatim as response/request header field names. A boolean
 * `true` previously passed validation and became the literal header name `"true"`, so the option
 * is restricted to the documented `string|false` contract and the name is validated up front.
 */

const FIELD_NAME = /^[!#$%&'*+.^_`|~0-9A-Za-z-]+$/;

function isValidId(id) {
  if (typeof id !== 'string' || id.length === 0 || id.length > MAX_ID_LENGTH) {
    return false;
  }

  for (let i = 0; i < id.length; i++) {
    const code = id.charCodeAt(i);

    // Allow printable ASCII and Latin-1 only: anything else either crashes
    // `res.setHeader` (controls, code points above U+00FF) or invites header
    // and log injection.
    if (code < 0x20 || (code > 0x7e && code < 0xa0) || code > 0xff) {
      return false;
    }
  }

  return true;
}

/**
 * Request id middleware.
 */

module.exports = ({ expose = 'Request-Id', header = 'Request-Id', query = 'requestId' } = {}) => {
  const options = { expose, header, query };

  for (const key of ['expose', 'header']) {
    if (options[key] === false) {
      continue;
    }

    if (typeof options[key] !== 'string' || !FIELD_NAME.test(options[key])) {
      throw new Error(`Option \`${key}\` requires \`false\` or a valid header field name`);
    }
  }

  if (options.query !== false && typeof options.query !== 'string') {
    throw new Error('Option `query` requires `false` or a string');
  }

  return async function requestId(ctx, next) {
    let id;

    if (query) {
      id = ctx.query[query];
    }

    if (!isValidId(id) && header) {
      id = ctx.get(header);
    }

    if (!isValidId(id)) {
      id = uuid();
    }

    if (expose) {
      ctx.set(expose, id);
    }

    ctx.state.id = id;

    await next();
  };
};
