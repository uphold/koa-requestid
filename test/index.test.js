'use strict';

/**
 * Module dependencies.
 */

const Koa = require('koa');
const request = require('supertest');
const requestId = require('..');

/**
 * Uuid regex.
 */

const uuid = /^[a-f0-9]{8}-[a-f0-9]{4}/;

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

  it('should expose a named function', () => {
    expect(requestId().name).toEqual('requestId');
  });

  it('should add a request id to `ctx.state` by default', () => {
    app.use(requestId());
    app.use(async ctx => {
      ctx.body = ctx.state.id;
    });

    return request(server)
      .get('/')
      .expect(uuid);
  });

  for (const option of ['expose', 'header', 'query']) {
    it(`should throw an error if \`${option}\` option is invalid`, () => {
      try {
        requestId({ [option]: 123 });

        fail();
      } catch (e) {
        expect(e.message).toEqual(`Option \`${option}\` requires a boolean or a string`);
      }
    });
  }

  it('should not check the querystring if `query` is false', () => {
    app.use(requestId({ query: false }));
    app.use(async ctx => {
      ctx.body = ctx.state.id;
    });

    return request(server)
      .get('/?requestId=foobar')
      .expect(uuid);
  });

  it('should not check the header if `header` is false', () => {
    app.use(requestId({ header: false }));
    app.use(async ctx => {
      ctx.body = ctx.state.id;
    });

    return request(server)
      .get('/')
      .set('request-id', 'foobar')
      .expect(uuid);
  });

  it('should not expose the header if `header` is false', () => {
    app.use(requestId({ expose: false }));
    app.use(async ctx => {
      ctx.body = ctx.state.id;
    });

    return request(server)
      .get('/')
      .set('request-id', 'foobar')
      .expect({});
  });

  it('should check the `requestId` querystring by default', () => {
    app.use(requestId());
    app.use(async ctx => {
      ctx.body = ctx.state.id;
    });

    return request(server)
      .get('/?requestId=foobar')
      .expect('foobar');
  });

  it('should check the `request-id` header by default', () => {
    app.use(requestId());
    app.use(async ctx => {
      ctx.body = ctx.state.id;
    });

    return request(server)
      .get('/')
      .set('request-id', 'foobar')
      .expect('foobar');
  });

  it('should expose the `request-id` by default', () => {
    app.use(requestId());
    app.use(async ctx => {
      ctx.body = ctx.response.header['request-id'];
    });

    return request(server)
      .get('/')
      .set('request-id', 'foobar')
      .expect('foobar');
  });

  it('should expose request id in a custom header if `expose` is set', () => {
    app.use(requestId({ expose: 'x-request-id' }));
    app.use(async ctx => {
      ctx.body = ctx.response.header['x-request-id'];
    });

    return request(server)
      .get('/')
      .set('request-id', 'foobar')
      .expect('foobar');
  });
});
