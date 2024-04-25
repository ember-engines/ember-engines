import Route from '@ember/routing/route';
import { getOwner } from '@ember/application';
import { deprecateTransitionMethods } from './deprecate-transition-methods';

/*
  Creates an aliased form of a method that properly resolves external routes.
*/
function externalAlias(methodName, deprecatedMethodName) {
  return function _externalAliasMethod(routeName, ...args) {
    deprecateTransitionMethods('route', deprecatedMethodName);

    let externalRoute = getOwner(this)._getExternalRoute(routeName);
    let router = this._router || this.router;
    return router[methodName](externalRoute, ...args);
  };
}

Route.reopen({
  transitionToExternal: externalAlias('transitionTo', 'transitionToExternal'),
  replaceWithExternal: externalAlias('replaceWith', 'replaceWithExternal'),
});
