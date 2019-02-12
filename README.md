# koa-requestid

## Status

[![npm version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]

## Installation

Install the package via `yarn`:

```sh
❯ yarn add koa-requestid
```

or via `npm`:

```sh
❯ npm install koa-requestid --save
```

## Usage

Use `koa-requestid` as a middleware for a [koa](https://github.com/koajs/koa) app. By default, it generates a unique uuid (v4) and exposes it on the response via the `Request-Id` header. The id is also saved as part of the request *state*.

In the following example, the generated uuid is manually exposed on the body for debugging purposes:

```js
const Koa = require('koa');
const requestId = require('koa-requestid');
const app = new Koa();

app.use(requestId());
app.use(async ctx => {
  ctx.body = ctx.state.id;
});

app.listen(3000);
```

Execute a request to the running app:

```bash
❯ curl -v http://localhost:3000

< HTTP/1.1 200 OK
< Request-Id: cc0f12c7-f3b6-4c86-94c2-8c4ce7751651

cc0f12c7-f3b6-4c86-94c2-8c4ce7751651
```

Sometimes it is also useful to pass a custom id via a request header or query string, specifically in debugging sessions. Please note that the input id is not sanitized, so the usual precautions apply.

Using the above snippet to send a custom via the default `Request-Id` header:

```bash
❯ curl -v -H 'Request-Id: foobar' http://localhost:3000

< HTTP/1.1 200 OK
< Request-Id: foobar

foobar
```

or using a query string parameter (default is `requestId`):

```bash
❯ curl -v http://localhost:3000?requestId=foobar

< HTTP/1.1 200 OK
< Request-Id: foobar

foobar
```

## Configuration

#### Arguments
1. `options` *(object)*: A dictionary of options.

#### Options
1. `expose` *(string|false)*: The name of the header to expose the id on the response, or `false` to disable.
2. `header` *(string|false)*: The name of the header to read the id on the request, or `false` to disable.
3. `query` *(string|false)*: The name of the header to read the id on the query string, or `false` to disable.

Example:

```js
const Koa = require('koa');
const requestId = require('koa-requestid');
const app = new Koa();

app.use(requestId({
  expose: 'X-Request-Id',
  header: 'X-Req-Id',
  query: 'request-id'
}));
```

This configuration would expose every generated request id via the `X-Request-Id` response header and accept a custom id via the `X-Req-Id` header or `request-id` query string parameter.

## Tests

```
❯ yarn test
```

## Release

```sh
npm version [<new version> | major | minor | patch] -m "Release %s"
```

## License

MIT

[npm-image]: https://img.shields.io/npm/v/koa-requestid.svg
[npm-url]: https://www.npmjs.com/package/koa-requestid
[travis-image]: https://travis-ci.org/uphold/koa-requestid.svg?branch=master
[travis-url]: https://travis-ci.org/uphold/koa-requestid
