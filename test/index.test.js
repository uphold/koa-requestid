'use strict';

/**
 * Module dependencies.
 */

const { afterEach, beforeEach, describe, it } = require('node:test');
const Koa = require('koa');
const request = require('supertest');
const requestId = require('../index.js');

/**
 * Uuid regex.
 */

const uuid = new RegExp(/^[a-f0-9]{8}-[a-f0-9]{4}/);

/**
 * Test `koa-requestid`.
 */

describe('koa-requestid', () => {
  let app;
  let server;

  beforeEach(() => {
    app = new Koa();
    server = app.listen();
  });

  afterEach(() => server.close());

  it('should expose a named function', context => {
    context.assert.strictEqual(requestId().name, 'requestId');
  });

  it('should add a request id to `ctx.state` by default', () => {
    app.use(requestId());
    app.use(ctx => {
      ctx.body = ctx.state.id;
    });

    return request(server).get('/').expect(uuid);
  });

  // `expose` and `header` are used verbatim as header field names, so they accept `false` or a
  // valid field name. `query` is a query-string key, so it accepts `false` or any string.
  for (const option of ['expose', 'header', 'query']) {
    const message = option === 'query'
      ? 'Option `query` requires `false` or a string'
      : `Option \`${option}\` requires \`false\` or a valid header field name`;

    it(`should throw an error if \`${option}\` option is invalid`, context => {
      context.assert.throws(() => requestId({ [option]: 123 }), { message });
    });
  }

  for (const option of ['expose', 'header']) {
    it(`should throw an error if \`${option}\` option is \`true\``, context => {
      // `true` would otherwise become the literal header field name "true".
      context.assert.throws(() => requestId({ [option]: true }), {
        message: `Option \`${option}\` requires \`false\` or a valid header field name`
      });
    });

    it(`should throw an error if \`${option}\` option is not a valid field name`, context => {
      context.assert.throws(() => requestId({ [option]: 'bad header name' }), {
        message: `Option \`${option}\` requires \`false\` or a valid header field name`
      });
    });
  }

  it('should not check the querystring if `query` is false', () => {
    app.use(requestId({ query: false }));
    app.use(ctx => {
      ctx.body = ctx.state.id;
    });

    return request(server).get('/?requestId=foobar').expect(uuid);
  });

  it('should not check the header if `header` is false', () => {
    app.use(requestId({ header: false }));
    app.use(ctx => {
      ctx.body = ctx.state.id;
    });

    return request(server).get('/').set('request-id', 'foobar').expect(uuid);
  });

  it('should not expose the header if `header` is false', () => {
    app.use(requestId({ expose: false }));
    app.use(ctx => {
      ctx.body = ctx.state.id;
    });

    return request(server).get('/').set('request-id', 'foobar').expect({});
  });

  it('should check the `requestId` querystring by default', () => {
    app.use(requestId());
    app.use(ctx => {
      ctx.body = ctx.state.id;
    });

    return request(server).get('/?requestId=foobar').expect('foobar');
  });

  it('should check the `request-id` header by default', () => {
    app.use(requestId());
    app.use(ctx => {
      ctx.body = ctx.state.id;
    });

    return request(server).get('/').set('request-id', 'foobar').expect('foobar');
  });

  it('should expose the `request-id` by default', () => {
    app.use(requestId());
    app.use(ctx => {
      ctx.body = ctx.response.header['request-id'];
    });

    return request(server).get('/').set('request-id', 'foobar').expect('foobar');
  });

  it('should expose request id in a custom header if `expose` is set', () => {
    app.use(requestId({ expose: 'x-request-id' }));
    app.use(ctx => {
      ctx.body = ctx.response.header['x-request-id'];
    });

    return request(server).get('/').set('request-id', 'foobar').expect('foobar');
  });

  it('should ignore a query id containing characters that are invalid in headers', async context => {
    app.use(requestId());
    app.use(ctx => {
      ctx.body = ctx.state.id;
    });

    const res = await request(server).get('/?requestId=abc%0d%0aX-Injected:%20yes').expect(uuid);

    context.assert.strictEqual(res.headers['request-id'], res.text);
    context.assert.strictEqual(res.headers['x-injected'], undefined);
  });

  it('should ignore a query id passed multiple times', async context => {
    app.use(requestId());
    app.use(ctx => {
      ctx.body = ctx.state.id;
    });

    const res = await request(server).get('/?requestId=aaa&requestId=bbb').expect(uuid);

    context.assert.strictEqual(res.headers['request-id'], res.text);
  });

  it('should ignore a query id longer than 255 characters', () => {
    app.use(requestId());
    app.use(ctx => {
      ctx.body = ctx.state.id;
    });

    return request(server)
      .get(`/?requestId=${'x'.repeat(256)}`)
      .expect(uuid);
  });

  it('should ignore a query id containing a code point above U+00FF', () => {
    app.use(requestId());
    app.use(ctx => {
      ctx.body = ctx.state.id;
    });

    return request(server).get('/?requestId=%E2%82%AC').expect(uuid);
  });

  it('should accept a query id with printable Latin-1 characters', () => {
    app.use(requestId());
    app.use(ctx => {
      ctx.body = ctx.state.id;
    });

    return request(server).get('/?requestId=caf%C3%A9').expect('caf\u00e9');
  });

  it('should fall back to the header if the query id is invalid', () => {
    app.use(requestId());
    app.use(ctx => {
      ctx.body = ctx.state.id;
    });

    return request(server).get('/?requestId=%E2%82%AC').set('request-id', 'foobar').expect('foobar');
  });
});
