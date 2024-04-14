import Controller from '@ember/controller';
import { getOwner } from '@ember/application';
import { deprecateTransitionMethods } from './deprecate-transition-methods';

Controller.reopen({
  /*
    Creates an aliased form of a method that properly resolves external routes.
  */
  transitionToExternalRoute(routeName, ...args) {
    deprecateTransitionMethods('controller', 'transitionToExternalRoute');

    let externalRoute = getOwner(this)._getExternalRoute(routeName);
    let target = this.target;
    let method = target.transitionToRoute || target.transitionTo;

    return method.apply(target, [externalRoute, ...args]);
  },
});
