import Engine from 'ember-engines/engine';
import Resolver from 'ember-resolver';
import loadInitializers from 'ember-load-initializers';
import config from './config/environment';

import compatModules from '@embroider/virtual/compat-modules';

const { modulePrefix } = config;

class Eng extends Engine {
  modulePrefix = config.modulePrefix;
  Resolver = Resolver.withModules(compatModules);
  init() {
    super.init(...arguments);
    this.dependencies = {
      services: ['store'],
    };
  }
}

loadInitializers(Eng, modulePrefix, compatModules);

export default Eng;
