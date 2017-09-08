import resolver from './helpers/resolver';
import { setResolver } from 'ember-qunit';
import preloadAssets from 'ember-asset-loader/test-support/preload-assets';
import manifest from '../config/asset-manifest';
import { start } from 'ember-cli-qunit';

setResolver(resolver);
preloadAssets(manifest).then(start);
