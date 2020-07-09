import LinkComponent from '@ember/routing/link-component';
import { getOwner } from '@ember/application';
import { set, get } from '@ember/object';

export default LinkComponent.extend({
  didReceiveAttrs() {
    this._super(...arguments);

    const owner = getOwner(this);

    if (owner.mountPoint) {
      // https://emberjs.github.io/rfcs/0459-angle-bracket-built-in-components.html
      const routeKey = 'targetRouteName' in this ? 'targetRouteName' : 'route';
      const routeName = get(this, routeKey);
      const externalRoute = owner._getExternalRoute(routeName);
      set(this, routeKey, externalRoute);
    }
  }
});
