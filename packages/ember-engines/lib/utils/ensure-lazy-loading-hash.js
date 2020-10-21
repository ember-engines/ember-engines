'use strict';

/**
 * Ensure lazyLoading is a hash, retain backwards compatibility with using a boolean value
 *
 * @private
 * @param {Object} context
 * @return {Object}
 */
module.exports = function ensureLazyLoadingHash(context) {
  if (
    typeof context.lazyLoading === 'boolean' ||
    context.lazyLoading === undefined
  ) {
    context.lazyLoading = {
      enabled: Boolean(context.lazyLoading),
    };
  }

  return context;
};
