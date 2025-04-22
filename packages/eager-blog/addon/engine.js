import Engine from 'ember-engines/engine';
import Resolver from 'ember-resolver';
import { macroCondition, importSync, dependencySatisfies } from '@embroider/macros';
import loadInitializers from 'ember-load-initializers';
import config from './config/environment';
let compatModules = undefined;
if (macroCondition(dependencySatisfies('@embroider/core', '*'))) {
  compatModules = importSync('@embroider/virtual/compat-modules');
}

const { modulePrefix } = config;

class Eng extends Engine {
  modulePrefix = config.modulePrefix;
  Resolver = Resolver.withModules(compatModules);
}

loadInitializers(Eng, modulePrefix, compatModules);

export default Eng;
