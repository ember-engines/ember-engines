import { LinkTo as RoutingLinkComponent } from '@ember/routing';
import { getOwner } from '@ember/application';
import { set, get } from '@ember/object';
import { macroCondition, dependencySatisfies, importSync } from '@embroider/macros';

let LinkToExternal;
let LinkComponent;

if (macroCondition(dependencySatisfies('@ember/legacy-built-in-components', '*'))) {
  let { LinkComponent: LegacyLinkComponent } = importSync('@ember/legacy-built-in-components');
  LinkComponent = LegacyLinkComponent;
} else {
  LinkComponent = RoutingLinkComponent;
}

if (macroCondition(dependencySatisfies('ember-source', '> 3.24.0-alpha.1'))) {
  LinkToExternal = class LinkToExternal extends LinkComponent {
    _namespaceRoute(targetRouteName) {
      const owner = getOwner(this);
     
      if (!owner.mountPoint) {
        return super._namespaceRoute(...arguments);
      }
      
      const externalRoute = owner._getExternalRoute(targetRouteName);

      return externalRoute;
    }

    // override LinkTo's assertLinkToOrigin method to noop. In LinkTo, this assertion
    // checks to make sure LinkTo is not being used inside a routeless engine
    // See this PR here for more details: https://github.com/emberjs/ember.js/pull/19477
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
