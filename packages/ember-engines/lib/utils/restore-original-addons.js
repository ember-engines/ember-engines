'use strict';

module.exports = function restoreOriginalAddons(addon) {
  if (addon._orginalAddons) {
    addon.addons = addon._orginalAddons;
  }

  if (addon.addons.length > 0) {
    addon.addons.forEach(restoreOriginalAddons);
  }
};
