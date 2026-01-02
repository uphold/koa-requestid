/**
 * Module dependencies.
 */

import { defineConfig } from 'eslint/config';
import globals from 'globals';
import upholdConfig from 'eslint-config-uphold';

/**
 * `ESLint` configuration.
 */

export default defineConfig([
  upholdConfig,
  {
    files: ['test/**/*.js'],
    languageOptions: {
      globals: globals.jest
    },
    name: 'koa-requestid/tests'
  }
]);
