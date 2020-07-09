'use strict';

/**
 * Deduplicate one addon's children addons recursively from hostAddons.
 *
 * @private
 * @param {Object} hostAddons
 * @param {EmberAddon} dedupedAddon
 * @param {String} treeName
 */
module.exports = function deeplyNonDuplicatedAddon(hostAddons, dedupedAddon, treeName) {
  if (dedupedAddon.addons.length === 0) {
    return;
  }

  dedupedAddon._orginalAddons = dedupedAddon.addons;
  dedupedAddon.addons = dedupedAddon.addons.filter(addon => {
    // nested lazy engine will have it's own deeplyNonDuplicatedAddon, just keep it here
    if (addon.lazyLoading && addon.lazyLoading.enabled) {
      return true;
    }

    if (addon.addons.length > 0) {
      addon._orginalAddons = addon.addons;
      deeplyNonDuplicatedAddon(hostAddons, addon, treeName);
    }

    let hostAddon = hostAddons[addon.name];

    if (hostAddon && hostAddon.cacheKeyForTree) {
      let innerCacheKey = addon.cacheKeyForTree(treeName);
      let hostAddonCacheKey = hostAddon.cacheKeyForTree(treeName);

      if (
        innerCacheKey != null &&
        innerCacheKey === hostAddonCacheKey
      ) {
        // the addon specifies cache key and it is the same as host instance of the addon, skip the tree
        return false;
      }
    }

    return true;
  });
}
