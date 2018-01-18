import Application from '@ember/application';
import Resolver from 'ember-resolver';
import loadInitializers from 'ember-load-initializers';
import config from './config/environment';

const App = Application.extend({
  modulePrefix: config.modulePrefix,
  podModulePrefix: config.podModulePrefix,
  Resolver,
  init() {
    this._super(...arguments);
    this.engines = {
      emberBlog: {
        dependencies: {
          services: [{ 'data-store': 'store' }],
          externalRoutes: {
            home: 'application',
          },
        },
      },
      emberChat: {
        dependencies: {
          services: ['store'],
        },
      },
    }
  }
});

loadInitializers(App, config.modulePrefix);

export default App;
