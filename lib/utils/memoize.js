'use strict';

const calculateCacheKeyForTree = require('calculate-cache-key-for-tree');
const CACHE = Object.create(null);

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
