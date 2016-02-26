/* globals require, requirejs */
import Ember from 'ember';
import Resolver from 'ember-resolver';
import { ROUTES } from './routes';

export default Resolver.extend({
  resolveEngine(parsedName) {
    // TODO: clean this up to use latest ember-resolver from npm
    let engineName = parsedName.fullNameWithoutType;
    let engineModule = engineName + '/engine';

    if (requirejs.entries[engineModule]) {
      let module = require(engineModule);

      return module.default;
    }
  },

  resolveRouteMap(parsedName) {
    let engineName = parsedName.fullNameWithoutType;
    let engineRoutesModule = engineName + '/routes';

    if (requirejs.entries[engineRoutesModule]) {
      let module = require(engineRoutesModule);
      let routeMap = module.default;

      Ember.assert(`The route map for ${engineName} should be wrapped by 'buildRoutes' before exporting.` , routeMap[ROUTES]);

      return routeMap;
    }
  }
});
