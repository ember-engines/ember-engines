import resolver from './helpers/resolver';
import {
  setResolver
} from 'ember-qunit';
import preloadAssets from './helpers/ember-engines/preload-assets';

preloadAssets();

setResolver(resolver);
