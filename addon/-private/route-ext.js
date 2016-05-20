import Ember from 'ember';

const {
  Route,
  getOwner
} = Ember;

/*
  Creates an aliased form of a method that properly resolves external routes.
*/
function externalAlias(methodName) {
  return function _externalAliasMethod(routeName, ...args) {
    let externalRoute = getOwner(this)._getExternalRoute(routeName);
    this.router[methodName](externalRoute, ...args);
  };
}

Route.reopen({
  transitionToExternal: externalAlias('transitionTo'),
  replaceWithExternal: externalAlias('replaceWith')
});
