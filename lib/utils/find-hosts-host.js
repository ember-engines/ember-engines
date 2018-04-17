'use strict';

module.exports = function findHostsHost() {
  let foundHost = false;
  let current = this;
  let app;

  // Keep iterating upward until we don't have a grandparent.
  // Has to do this grandparent check because at some point we hit the project.
  do {
    if (current.lazyLoading.enabled === true) {
      if (foundHost) {
        return current;
      }

      foundHost = true;
    }

    app = current.app || app;
  } while (current.parent.parent && (current = current.parent));

  return foundHost && app;
}

