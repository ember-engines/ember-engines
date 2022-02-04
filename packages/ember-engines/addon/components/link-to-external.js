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

    _invoke() {
      // This patches @ember/legacy-built-in-components
      // @ember/legacy-built-in-components don't call the generated transition resulting in nothing.
      // Likely this is a bug caused because the addon doesn't have acces to flaggedInstrument function
      // imported from glimmer which is triggering the transition
      // https://github.com/emberjs/ember-legacy-built-in-components/blob/v0.4.0/addon/components/link-to.ts#L804
      // https://github.com/emberjs/ember.js/blob/v3.28.8/packages/%40ember/-internals/glimmer/lib/components/-link-to.ts#L767
      if (macroCondition(dependencySatisfies('@ember/legacy-built-in-components', '*'))) {
        const result = super._invoke(...arguments);

        let {
          _route: routeName,
          _models: models,
          _query: queryParams,
          replace: shouldReplace,
        } = this;

        let payload = {
          queryParams,
          routeName,
        };

        this._generateTransition(
          payload,
          routeName,
          models,
          queryParams,
          shouldReplace
        )();

        return result;
      }

      return super._invoke(...arguments);
    }
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
