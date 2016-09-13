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
      let fullRouteName = owner.mountPoint + '.' + get(this, 'targetRouteName');

      set(this, 'targetRouteName', fullRouteName);
    }
  }
});
