// this file is only used when ember is older than 3.24
// ember-engines/addon/-private/engine-ext.js
import RoutingLinkComponent from '@ember/routing/link-component';
import { getOwner } from '@ember/application';
import { computed, get, set } from '@ember/object';
import { typeOf } from '@ember/utils';
import { assert, deprecate } from '@ember/debug';
import { macroCondition, dependencySatisfies } from '@embroider/macros';

let LinkTo;

if (macroCondition(dependencySatisfies('ember-source', '>= 3.24.1 || >=4.x'))) {
  deprecate(
    `Importing from 'ember-engines/components/link-to-component' is deprecated, please use '@ember/routing/link-component' directly`,
    false,
    {
      id: 'ember-engines.link-to-override',
      until: '0.9.0',
      for: 'ember-engines',
      since: {
        enabled: '0.8.10'
      }
    }
  );

  LinkTo = RoutingLinkComponent;
} else {
  LinkTo = RoutingLinkComponent.extend({
    _route: computed('route', '_mountPoint', '_currentRouteState', function () {
      let routeName = this._super(...arguments);
      let mountPoint = get(this, '_mountPoint');

      if (mountPoint && routeName !== get(this, '_currentRoute')) {
        return this._namespacePropertyValue(mountPoint, routeName);
      }

      return routeName;
    }),

    _mountPoint: computed(function () {
      return getOwner(this).mountPoint;
    }),

    didReceiveAttrs() {
      this._super(...arguments);

      let owner = getOwner(this);

      assert(
        `You attempted to use {{link-to}} within a routeless engine, this is not supported. Use {{link-to-external}} to construct links within a routeless engine. See http://ember-engines.com/guide/linking-and-external-links for more info.`,
        owner.mountPoint !== undefined
      );

      if (owner.mountPoint) {
        // Prepend engine mount point to targetRouteName
        if ('targetRouteName' in this) {
          this._prefixProperty(owner.mountPoint, 'targetRouteName');
        }

        // Prepend engine mount point to current-when if set
        if (get(this, 'current-when') !== null) {
          this._prefixProperty(owner.mountPoint, 'current-when');
        }
      }
    },

    _prefixProperty(prefix, prop) {
      let propValue = get(this, prop);

      // Sometimes `targetRouteName` will be a class
      if (typeOf(propValue) !== 'string') {
        return;
      }

      let namespacedPropValue;
      if (prop === 'current-when') {
        // `current-when` is a space-separated list of routes
        namespacedPropValue = propValue.split(' ');
        namespacedPropValue = namespacedPropValue.map(propValue =>
          this._namespacePropertyValue(prefix, propValue)
        );
        namespacedPropValue = namespacedPropValue.join(' ');
      } else {
        namespacedPropValue = this._namespacePropertyValue(prefix, propValue);
      }

      set(this, prop, namespacedPropValue);
    },

    _namespacePropertyValue(prefix, propValue) {
      if (propValue === 'application') {
        return prefix;
      } else {
        return prefix + '.' + propValue;
      }
    }
  });
}

export default LinkTo;
