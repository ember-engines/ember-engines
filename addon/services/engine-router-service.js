import Ember from 'ember';
import Service from '@ember/service';
import { assert } from '@ember/debug';
import { computed } from '@ember/object';
import { reads } from '@ember/object/computed';
import { getOwner } from '@ember/application';

// @HACK: since `getEngineParent` is not exported
function getEngineParent(engine) {
  const symbolPrefix = `__ENGINE_PARENT${Ember.GUID_KEY}`;
  const symbol = Object.keys(engine).find(k => k.startsWith(symbolPrefix));
  if (!symbol) {
    return null;
  }
  return engine[symbol];
}

export default Service.extend({
  init() {
    this._super(...arguments);

    this.set('_externalRoutes', getOwner(this)._externalRoutes);
    this.set('_mountPoint', getOwner(this).mountPoint);
  },

  rootURL: reads('externalRouter.rootURL'),

  currentURL: reads('externalRouter.currentURL'),

  currentRouteName: computed('externalRouter.currentRouteName', function () {
    if (this.externalRouter.currentRouteName === this._mountPoint) {
      return 'application';
    }
    return this.externalRouter.currentRouteName.slice(this._mountPoint.length + 1);
  }),

  externalRouter: computed(function () {
    return this.rootApplication.lookup('service:router');
  }),

  rootApplication: computed(function () {
    let parent = getEngineParent(getOwner(this));
    while (getEngineParent(parent)) {
      parent = getEngineParent(parent);
    }
    return parent;
  }),

  getInternalRouteName(internalRouteName) {
    // https://github.com/ember-engines/ember-engines/blob/ec4d1ae7a413a7e5d9e57a4e3b2e0f0d19a0afcd/addon/components/link-to-component.js#L52-L57
    if (internalRouteName === 'application') {
      return this._mountPoint;
    }
    return `${this._mountPoint}.${internalRouteName}`;
  },

  getExternalRouteName(externalRouteName) {
    assert(
      `External route '${externalRouteName}' is unknown.`,
      externalRouteName in this._externalRoutes
    );
    return this._externalRoutes[externalRouteName];
  },

  transitionTo(routeName, ...args) {
    return this.externalRouter.transitionTo(
      this.getInternalRouteName(routeName),
      ...args
    );
  },

  transitionToExternal(routeName, ...args) {
    return this.externalRouter.transitionTo(
      this.getExternalRouteName(routeName),
      ...args
    );
  },

  replaceWith(routeName, ...args) {
    return this.externalRouter.replaceWith(
      this.getInternalRouteName(routeName),
      ...args
    );
  },

  replaceWithExternal(routeName, ...args) {
    return this.externalRouter.replaceWith(
      this.getExternalRouteName(routeName),
      ...args
    );
  },

  urlFor(routeName, ...args) {
    return this.externalRouter.urlFor(
      this.getInternalRouteName(routeName),
      ...args
    );
  },

  urlForExternal(routeName, ...args) {
    return this.externalRouter.urlFor(
      this.getExternalRouteName(routeName),
      ...args
    );
  },

  isActive(routeName, ...args) {
    return this.externalRouter.isActive(
      this.getInternalRouteName(routeName),
      ...args
    );
  },

  isActiveExternal(routeName, ...args) {
    return this.externalRouter.isActive(
      this.getExternalRouteName(routeName),
      ...args
    );
  }
});
