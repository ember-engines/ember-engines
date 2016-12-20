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
      let fullRouteName = owner.mountPoint + '.' + get(this, 'targetRouteName');
      set(this, 'targetRouteName', fullRouteName);

      // Prepend engine mount point to current-when if set
      let currentWhen = get(this, 'current-when');
      if (currentWhen !== null) {
        let fullCurrentWhen = owner.mountPoint + '.' + get(this, 'current-when');
        set(this, 'current-when', fullCurrentWhen);
      }
    }
  }
});
