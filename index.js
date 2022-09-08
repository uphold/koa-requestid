'use strict';

/**
 * Module dependencies.
 */

const { v4: uuid } = require('uuid');

/**
 * Request id middleware.
 */

module.exports = ({ expose = 'Request-Id', header = 'Request-Id', query = 'requestId' } = {}) => {
  const options = { expose, header, query };

  for (const key in options) {
    if (typeof options[key] !== 'boolean' && typeof options[key] !== 'string') {
      throw new Error(`Option \`${key}\` requires a boolean or a string`);
    }
  }

  return async function requestId(ctx, next) {
    let id;

    if (query) {
      id = ctx.query[query];
    }

    if (!id && header) {
      id = ctx.get(header);
    }

    if (!id) {
      id = uuid();
    }

    if (expose) {
      ctx.set(expose, id);
    }

    ctx.state.id = id;

    await next();
  };
};
