import Ember from 'ember';
import { attributeMungingMethod } from './link-to-utils';

const {
  LinkComponent,
  getOwner,
  get,
  set
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

    let namespacedPropValue;
    if (propValue === 'application') {
      namespacedPropValue = prefix;
    } else {
      namespacedPropValue = prefix + '.' + propValue;
    }

    set(this, prop, namespacedPropValue);
  }
});
