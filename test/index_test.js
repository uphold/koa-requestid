
/**
 * Module dependencies.
 */

import koa from 'koa';
import request from 'supertest';
import requestId from '../src/';
import should from 'should';

/**
 * Uuid regex.
 */

const uuid = /^[a-f0-9]{8}-[a-f0-9]{4}/;

/**
 * Test `koa-requestid`.
 */

describe('koa-requestid', () => {
  let app;

  beforeEach(() => {
    app = koa();
  });

  it('should expose a named function', () => {
    requestId().name.should.equal('requestId');
  });

  it('should add a request id to `ctx.state` by default', (done) => {
    app.use(requestId());
    app.use(function *() {
      this.body = this.state.id;
    });

    request(app.listen())
      .get('/')
      .expect(uuid, done);
  });

  it('should add a request id to `ctx` on older versions of koa', (done) => {
    app.use(function *(next) {
      delete this.state;

      yield next;
    });

    app.use(requestId());
    app.use(function *() {
      this.body = this.id;
    });

    request(app.listen())
      .get('/')
      .expect(uuid, done);
  });

  for (const option of ['expose', 'header', 'query']) {
    it(`should throw an error if \`${option}\` option is invalid`, () => {
      try {
        requestId({ [option]: 123 });

        should.fail();
      } catch (e) {
        e.message.should.equal(`Option \`${option}\` requires a boolean or a string`);
      }
    });
  }

  it('should not check the querystring if `query` is false', (done) => {
    app.use(requestId({ query: false }));
    app.use(function *() {
      this.body = this.state.id;
    });

    request(app.listen())
      .get('/?requestId=foobar')
      .expect(uuid, done);
  });

  it('should not check the header if `header` is false', (done) => {
    app.use(requestId({ header: false }));
    app.use(function *() {
      this.body = this.state.id;
    });

    request(app.listen())
      .get('/')
      .set('request-id', 'foobar')
      .expect(uuid, done);
  });

  it('should not expose the header if `header` is false', (done) => {
    app.use(requestId({ expose: false }));
    app.use(function *() {
      this.body = this.state.id;
    });

    request(app.listen())
      .get('/')
      .set('request-id', 'foobar')
      .expect({}, done);
  });

  it('should check the `requestId` querystring by default', (done) => {
    app.use(requestId());
    app.use(function *() {
      this.body = this.state.id;
    });

    request(app.listen())
      .get('/?requestId=foobar')
      .expect('foobar', done);
  });

  it('should check the `request-id` header by default', (done) => {
    app.use(requestId());
    app.use(function *() {
      this.body = this.state.id;
    });

    request(app.listen())
      .get('/')
      .set('request-id', 'foobar')
      .expect('foobar', done);
  });

  it('should expose the `request-id` by default', (done) => {
    app.use(requestId());
    app.use(function *() {
      this.body = this.response.header['request-id'];
    });

    request(app.listen())
      .get('/')
      .set('request-id', 'foobar')
      .expect('foobar', done);
  });

  it('should expose request id in a custom header if `expose` is set', (done) => {
    app.use(requestId({ expose: 'x-request-id' }));
    app.use(function *() {
      this.body = this.response.header['x-request-id'];
    });

    request(app.listen())
      .get('/')
      .set('request-id', 'foobar')
      .expect('foobar', done);
  });
});
