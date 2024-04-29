import * as QUnit from 'qunit';
import { setup } from 'qunit-dom';
import { start } from 'ember-qunit';
import setupSinon from 'ember-sinon-qunit';
import config from '../config/environment';

import Application from '../app';
import { setApplication } from '@ember/test-helpers';
import { registerDeprecationHandler } from '@ember/debug';

setApplication(Application.create(config.APP));
setup(QUnit.assert);
setupSinon();

start();

let deprecations;

registerDeprecationHandler((message, options, next) => {
  // In case a deprecation is issued before a test is started.
  if (!deprecations) {
    deprecations = [];
  }

  deprecations.push(message);
  next(message, options);
});

QUnit.testStart(function () {
  deprecations = [];
});

QUnit.assert.noDeprecations = function (callback) {
  let originalDeprecations = deprecations;
  deprecations = [];

  callback();
  this.deepEqual(deprecations, [], 'Expected no deprecations during test.');

  deprecations = originalDeprecations;
};

QUnit.assert.deprecations = function (callback, expectedDeprecations) {
  let originalDeprecations = deprecations;
  deprecations = [];

  callback();
  this.deepEqual(
    deprecations,
    expectedDeprecations,
    'Expected deprecations during test.',
  );

  deprecations = originalDeprecations;
};

QUnit.assert.deprecationsInclude = function (message) {
  this.pushResult({
    result: deprecations.indexOf(message) > -1,
    actual: deprecations,
    message: `Expected to find \`${message}\` deprecation.`,
  });
};

QUnit.assert.deprecationsExclude = function (message) {
  this.pushResult({
    result: deprecations.indexOf(message) === -1,
    actual: deprecations,
    message: `Expected to not find \`${message}\` deprecation.`,
  });
};
