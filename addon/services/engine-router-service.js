import Ember from 'ember';
import Service from '@ember/service';
import { assert } from '@ember/debug';
import { computed } from '@ember/object';
import { reads } from '@ember/object/computed';
import { getOwner } from '@ember/application';
import { namespaceEngineRouteName } from '../utils/namespace-engine-route-name';

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

  getExternalRouteName(externalRouteName) {
    assert(
      `External route '${externalRouteName}' is unknown.`,
      externalRouteName in this._externalRoutes
    );
    return this._externalRoutes[externalRouteName];
  },

  transitionTo(routeName, ...args) {
    return this.externalRouter.transitionTo(
      namespaceEngineRouteName(this._mountPoint, routeName),
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
      namespaceEngineRouteName(this._mountPoint, routeName),
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
      namespaceEngineRouteName(this._mountPoint, routeName),
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
      namespaceEngineRouteName(this._mountPoint, routeName),
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
