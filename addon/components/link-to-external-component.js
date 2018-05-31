import LinkComponent from '@ember/routing/link-component';
import { getOwner } from '@ember/application';
import { set, get } from '@ember/object';

export default LinkComponent.extend({
  didReceiveAttrs() {
    this._super(...arguments);

    const owner = getOwner(this);

    if (owner.mountPoint) {
      const targetRouteName = get(this, 'targetRouteName');
      const externalRoute = owner._getExternalRoute(targetRouteName);
      set(this, 'targetRouteName', externalRoute);
    }
  },
});
