'use strict';

/**
 * Ensure lazyLoading is a hash, retain backwards compatibility with using a boolean value
 *
 * @private
 * @param {Object} context
 * @return {Object}
 */

module.exports = function ensureLazyLoginHash(context) {
  if (typeof context.lazyLoading === 'boolean') {
    context.lazyLoading = {
      enabled: context.lazyLoading
    };
  }

  return context;
}