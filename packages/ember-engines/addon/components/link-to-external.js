import LinkComponent from '@ember/routing/link-component';
import { getOwner } from '@ember/application';
import { set, get } from '@ember/object';
import { gte } from 'ember-compatibility-helpers';

let LinkToExternal;

if (gte('ember-source', '3.24.0-alpha.1')) {
  LinkToExternal = class LinkToExternal extends LinkComponent {
    _namespaceRoute(targetRouteName) {
      const owner = getOwner(this);
      const externalRoute = owner._getExternalRoute(targetRouteName);

      return externalRoute;
    }

    // override LinkTo's assertLinkToOrigin method to noop. In LinkTo, this assertion
    // checks to make sure LinkTo is not being used inside a routeless engine
    assertLinkToOrigin() {}
  };
} else {
  LinkToExternal = LinkComponent.extend({
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
}

export default LinkToExternal;
