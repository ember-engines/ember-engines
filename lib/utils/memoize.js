'use strict';

const calculateCacheKeyForTree = require('calculate-cache-key-for-tree');
const CACHE_STORE = new WeakMap(); // eslint-disable-line no-undef
const DEFAULT_CACHE_TARGET = {};

module.exports = function memoize(func) {
  return function _memoize() {
    const cacheTarget = this.project || DEFAULT_CACHE_TARGET;

    let cache = CACHE_STORE.get(cacheTarget);
    if (!cache) {
      cache = Object.create(null);
      CACHE_STORE.set(cacheTarget, cache);
    }

    let cacheKey = calculateCacheKeyForTree(func.name, this);
    if (cache[cacheKey]) {
      return cache[cacheKey];
    } else {
      return (cache[cacheKey] = func.apply(this, arguments));
    }
  };
};
