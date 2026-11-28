import Application from '../app/app.js';
import config, { enterTestMode } from '../app/config/environment.js';
import * as QUnit from 'qunit';
import { setApplication } from '@ember/test-helpers';
import { setup } from 'qunit-dom';
import { start as qunitStart, setupEmberOnerrorValidation } from 'ember-qunit';

export function start() {
  enterTestMode();
  setApplication(Application.create(config.APP));

  setup(QUnit.assert);
  setupEmberOnerrorValidation();

  // The laziness test must run before anything visits an engine.
  QUnit.config.reorder = false;

  qunitStart();
}
