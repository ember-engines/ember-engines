import Ember from 'ember';
import { attributeMungingMethod } from '../-private/link-to-utils';

const {
  LinkComponent,
  getOwner,
  get,
  set
} = Ember;

export default LinkComponent.extend({
  [attributeMungingMethod]() {
    this._super(...arguments);

    const owner = getOwner(this);

    if (owner.mountPoint) {
      const targetRouteName = get(this, 'targetRouteName');
      const externalRoute = owner._getExternalRoute(targetRouteName);
      set(this, 'targetRouteName', externalRoute);
    }
  }
});
