const resetMemoize = require('./utils/memoize')._reset;

/**
 * Reset cached state (useful in tests).
 * @public
 */
module.exports.resetCaches = function resetCaches() {
  resetMemoize();
};
