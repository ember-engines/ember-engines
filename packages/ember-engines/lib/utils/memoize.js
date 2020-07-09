'use strict';

const calculateCacheKeyForTree = require('calculate-cache-key-for-tree');
const CACHE = Object.create(null);

/**
 * Return the cached result of calculateCacheKeyForTree
 *
 * @private
 * @param {Object} func
 * @return {Object}
 */

function memoize(func) {
  return function() {
    let cacheKey = calculateCacheKeyForTree(func.name, this);
    if (CACHE[cacheKey]) {
      return CACHE[cacheKey];
    } else {
      return (CACHE[cacheKey] = func.apply(this, arguments));
    }
  }
}

module.exports.memoize = memoize;
