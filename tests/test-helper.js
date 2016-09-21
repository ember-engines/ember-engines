import resolver from './helpers/resolver';
import {
  setResolver
} from 'ember-qunit';
import preloadAssets from 'ember-asset-loader/test-support/preload-assets';
import manifest from '../config/asset-manifest';

preloadAssets(manifest);

setResolver(resolver);
