import LinkComponent from '@ember/routing/link-component';
import { getOwner } from '@ember/application';
import { set, get } from '@ember/object';
import { typeOf } from '@ember/utils';
import { assert } from '@ember/debug';

export default LinkComponent.extend({
  didReceiveAttrs() {
    this._super(...arguments);

    let owner = getOwner(this);

    assert(
      `You attempted to use {{link-to}} within a routeless engine, this is not supported. Use {{link-to-external}} to construct links within a routeless engine. See http://ember-engines.com/guide/linking-and-external-links for more info.`,
      owner.mountPoint !== undefined
    );

    if (owner.mountPoint) {
      // https://emberjs.github.io/rfcs/0459-angle-bracket-built-in-components.html
      const routeKey = 'targetRouteName' in this ? 'targetRouteName' : 'route';

      // Prepend engine mount point to targetRouteName
      this._prefixProperty(owner.mountPoint, routeKey);

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
