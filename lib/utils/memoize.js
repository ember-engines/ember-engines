'use strict';

var calculateCacheKeyForTree = require('calculate-cache-key-for-tree');
var CACHE = Object.create(null);

module.exports = function memoize(func) {
  return function _memoize() {
    var cacheKey = calculateCacheKeyForTree(func.name, this);
    if (CACHE[cacheKey]) {
      return CACHE[cacheKey];
    } else {
      return (CACHE[cacheKey] = func.apply(this, arguments));
    }
  };
};
