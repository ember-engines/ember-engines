import Application from '../demo-app/app.js';
import config, { enterTestMode } from '../demo-app/config.js';
import * as QUnit from 'qunit';
import { setApplication } from '@ember/test-helpers';
import { setup } from 'qunit-dom';
import { start as qunitStart, setupEmberOnerrorValidation } from 'ember-qunit';

export function start() {
  enterTestMode();
  setApplication(Application.create(config.APP));
  setup(QUnit.assert);
  setupEmberOnerrorValidation();
  QUnit.config.reorder = false;
  qunitStart();
}
