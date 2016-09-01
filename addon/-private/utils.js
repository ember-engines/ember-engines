import Ember from 'ember';

const {
  getOwner,
  Error: EmberError
} = Ember;

/*
  Returns an arguments array where the route name arg is prefixed based on the mount point
*/
export function prefixRouteNameArg(funcName, ...args) {
  let routeName = args[0];
  let owner = getOwner(this);
  let prefix = owner.mountPoint;

  // only alter the routeName if it's actually referencing a route.
  if (owner.routable && typeof routeName === 'string') {
    if (resemblesURL(routeName)) {
      throw new EmberError(`${funcName} cannot be used for URLs. Please use the route name instead.`);
    } else {
      routeName = `${prefix}.${routeName}`;
      args[0] = routeName;
    }
  }

  return args;
}

// Cloned private function required to check if a routeName resembles a url instead
function resemblesURL(str) {
  return typeof str === 'string' && ( str === '' || str.charAt(0) === '/');
}
