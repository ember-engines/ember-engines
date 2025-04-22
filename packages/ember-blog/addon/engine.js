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

export default class Eng extends Engine {
  modulePrefix = config.modulePrefix;
  Resolver = Resolver.withModules(compatModules);
  dependencies = {
    services: ['data-store'],
    externalRoutes: ['home'],
  };
}

loadInitializers(Eng, modulePrefix, compatModules);
