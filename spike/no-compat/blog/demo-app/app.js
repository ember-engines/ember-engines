import Application from '@ember/application';
import 'ember-engines-router-service/-private/engine-ext';
import * as UiIntl from 'ui-kit/services/ui-intl';
// Engines this engine depends on (comments), found by the plugin.
import { bundles, modules as engineModules } from 'virtual:ember-engines';
// The engine under test, eager and from source.
import * as BlogEngine from '../src/engine.js';
import blogRoutes from '../src/routes.js';
import config from './config.js';
import Router from './router.js';

window._embroiderEngineBundles_ = bundles;

export default class DemoApp extends Application {
  modules = {
    './router': Router,
    './config/environment': config,
    ...import.meta.glob('./{routes,templates,controllers,services}/**/*.{js,gjs}', { eager: true }),
    './services/ui-intl': UiIntl,
    ...engineModules,
    './engines/blog': BlogEngine,
    './route-maps/blog': blogRoutes,
  };

  // A stand-in for the host's side of the contract.
  engines = {
    blog: {
      dependencies: { services: ['session'], externalRoutes: { home: 'index', item: 'item', other: 'index' } },
    },
    comments: { dependencies: { services: ['session'], externalRoutes: { home: 'index' } } },
  };
}
