// Type definitions for koa-requestid 2.0.1
// Project: https://github.com/uphold/koa-requestid
// Definitions by: Steven McDowall <https://github.com/sjmcdowall>
//
// TypeScript Version: 2.3
import { Middleware } from 'koa';

declare function requestId(options?: {
  expose?: string | false;
  header?: string | false;
  query?: string | false;
}): Middleware;

export = requestId;
