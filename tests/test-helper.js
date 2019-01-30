import preloadAssets from 'ember-asset-loader/test-support/preload-assets';
import manifest from '../config/asset-manifest';
import { start } from 'ember-qunit';
import config from '../config/environment';

import Application from '../app';
import { setApplication } from '@ember/test-helpers';
setApplication(Application.create(config.APP));

preloadAssets(manifest).then(start);
