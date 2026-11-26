import Application from '@ember/application';
// What router-service's initializer did, as an explicit import.
import 'ember-engines-router-service/-private/engine-ext';
import * as UiIntl from 'ui-kit/services/ui-intl';
import { bundles, modules as engineModules } from 'virtual:ember-engines';
import config from './config/environment.js';
import Router from './router.js';

// Lazy engines for @embroider/router. With compat, Embroider generated this.
window._embroiderEngineBundles_ = bundles;

export default class App extends Application {
  modules = {
    './router': Router,
    './config/environment': config,
    ...import.meta.glob('./{routes,templates,controllers,services}/**/*.{js,gjs,ts,gts}', {
      eager: true,
    }),
    './services/ui-intl': UiIntl,
    // Route maps for every engine, nested ones included.
    ...engineModules,
  };

  // The host's side of each engine's contract, keyed by engine name. Ember builds
  // routable engine instances from the root owner, so nested engines are listed
  // here too.
  engines = {
    blog: {
      dependencies: {
        services: ['session'],
        externalRoutes: { home: 'account', item: 'item', other: 'blog-two' },
      },
    },
    comments: {
      dependencies: { services: ['session'], externalRoutes: { home: 'index' } },
    },
  };
}
