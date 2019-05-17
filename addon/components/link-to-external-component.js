import LinkComponent from '@ember/routing/link-component';
import { getOwner } from '@ember/application';
import { set, get } from '@ember/object';

export default LinkComponent.extend({
  didReceiveAttrs() {
    this._super(...arguments);

    const owner = getOwner(this);

    if (owner.mountPoint) {
      // `route` for Ember >= 3.10, `targetRouteName` for Ember <= 3.9
      const targetRouteName =  get(this, 'route') || get(this, 'targetRouteName');
      const externalRoute = owner._getExternalRoute(targetRouteName);
      set(this, 'route', externalRoute);
      set(this, 'targetRouteName', externalRoute);
    }
  },
});
