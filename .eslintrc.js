'use strict';

module.exports = {
  root: true,
  extends: "eslint:recommended",
  parserOptions: {
    ecmaVersion: 2017
  },
  env: {
    node: true
  },
  rules: {
      strict: [2, 'global']
  }
};
