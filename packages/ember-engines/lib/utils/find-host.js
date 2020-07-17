'use strict';

const ensureLazyLoadingHash = require('./ensure-lazy-loading-hash');

module.exports = function findHost() {
  let current = this;
  let app;

  // Keep iterating upward until we don't have a grandparent.
  // Has to do this grandparent check because at some point we hit the project.
  do {
    current = ensureLazyLoadingHash(current);
    if (current.lazyLoading.enabled === true) {
      return current;
    }
    app = current.app || app;
  } while (current.parent.parent && (current = current.parent));

  return app;
}

