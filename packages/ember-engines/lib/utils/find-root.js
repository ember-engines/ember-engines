'use strict';

module.exports = function findRoot() {
  let current = this;
  let app;

  // Keep iterating upward until we don't have a grandparent.
  // Has to do this grandparent check because at some point we hit the project.
  do {
    app = current.app || app;
  } while (current.parent.parent && (current = current.parent));

  return app;
};
