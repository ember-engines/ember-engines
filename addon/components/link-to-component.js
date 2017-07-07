import Ember from 'ember';
import { attributeMungingMethod } from '../-private/link-to-utils';

const {
  LinkComponent,
  getOwner,
  get,
  set,
  typeOf
} = Ember;

export default LinkComponent.extend({
  [attributeMungingMethod]() {
    this._super(...arguments);

    let owner = getOwner(this);

    if (owner.mountPoint) {
      // Prepend engine mount point to targetRouteName
      this._prefixProperty(owner.mountPoint, 'targetRouteName');

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
      namespacedPropValue = namespacedPropValue.map((propValue) => this._namespacePropertyValue(prefix, propValue));
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
