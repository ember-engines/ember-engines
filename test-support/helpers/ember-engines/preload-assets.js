import Ember from 'ember';
import AssetLoader from 'ember-asset-loader/services/asset-loader';
import manifest from '../../../asset-manifest';

const { Test, RSVP } = Ember;

/**
 * Preloads all the bundles specified in the asset manifest
 * to make sure all files are available for testing.
 *
 * Uses the Ember.Test.Promise class to make sure tests
 * wait for the assets to load first.
 *
 * @return {Promise}
 */
export default function preloadAssets() {
  const loader = AssetLoader.create();
  loader.pushManifest(manifest);

  const bundlePromises = Object.keys(manifest.bundles).map((bundle) => loader.loadBundle(bundle));
  const allBundles = RSVP.all(bundlePromises);

  return Test.resolve(allBundles);
}
