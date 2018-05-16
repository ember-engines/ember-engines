'use strict';

const calculateCacheKeyForTree = require('calculate-cache-key-for-tree');
let CACHE = Object.create(null);

module.exports = function memoize(func) {
  return function _memoize() {
    let cacheKey = calculateCacheKeyForTree(func.name, this);
    if (CACHE[cacheKey]) {
      return CACHE[cacheKey];
    } else {
      return (CACHE[cacheKey] = func.apply(this, arguments));
    }
  };
};

/**
 * Reset cached state (useful in tests).
 * @private
 */
module.exports._reset = function reset() {
  CACHE = Object.create(null);
};
