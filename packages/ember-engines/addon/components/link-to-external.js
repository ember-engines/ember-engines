import GlimmerComponent from '@glimmer/component';
import { setComponentTemplate } from '@glimmer/manager';
import { getOwner } from '@ember/application';
import { set, get } from '@ember/object';
import { macroCondition, dependencySatisfies, importSync } from '@embroider/macros';
import template from '../templates/link-to-external';

let LinkToExternal;

if (macroCondition(dependencySatisfies('ember-source', '>= v4.0.0-beta.9'))) {
  LinkToExternal = class LinkToExternal extends GlimmerComponent {
    get route () {
      const owner = getOwner(this);

      if (!owner.mountPoint) {
        return this.args.route;
      }

      return owner._getExternalRoute(this.args.route);
    }
  };

  setComponentTemplate(template, LinkToExternal);
} else if (macroCondition(dependencySatisfies('ember-source', '> 3.24.0-alpha.1'))) {
  const LinkComponent = importSync('@ember/routing/link-component');

  LinkToExternal = class LinkToExternal extends LinkComponent {
    _namespaceRoute(targetRouteName) {
      const owner = getOwner(this);

      if (!owner.mountPoint) {
        return super._namespaceRoute(...arguments);
      }

      return owner._getExternalRoute(targetRouteName);
    }

    // override LinkTo's assertLinkToOrigin method to noop. In LinkTo, this assertion
    // checks to make sure LinkTo is not being used inside a routeless engine
    // See this PR here for more details: https://github.com/emberjs/ember.js/pull/19477
    assertLinkToOrigin() {}
  };
} else {
  const LinkComponent = importSync('@ember/routing/link-component');

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
