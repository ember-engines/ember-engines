import Component from '@glimmer/component';
import { getOwner } from '@ember/owner';
import { on } from '@ember/modifier';
import { rootOwner } from '../-private/root-owner.js';

// Links to a route the host bound to one of this engine's `externalRoutes`.
// Resolves through the engine instance, then navigates with the host's router.
// Takes the arguments design-system link wrappers pass through, and follows
// <LinkTo> for loading models, `current-when` and `target`.
export default class LinkToExternal extends Component {
  get router() {
    return rootOwner(getOwner(this)).lookup('service:router');
  }

  get routeName() {
    return this.externalRoute(this.args.route);
  }

  // Without a mount point, the name is already a host route, as with v1
  // <LinkToExternal>: in the host (a design-system link it renders too) and in
  // a routeless engine rendered with {{mount}}.
  externalRoute(name) {
    let owner = getOwner(this);
    return owner.mountPoint ? owner._getExternalRoute(name) : name;
  }

  get models() {
    return this.args.models ?? ('model' in this.args ? [this.args.model] : []);
  }

  // Like <LinkTo>, a link whose models aren't loaded yet has no URL.
  get isLoading() {
    return this.models.some((model) => model === null || model === undefined);
  }

  get routeArgs() {
    if (this.args.query) {
      return [this.routeName, ...this.models, { queryParams: this.args.query }];
    }
    return [this.routeName, ...this.models];
  }

  get href() {
    if (this.isLoading) return '#';

    let routeArgs = this.routeArgs;

    // Before the first transition, as in a rendering test without visit(), a
    // route that needs the current route's params has no URL. Ember's routing
    // service swallows that error for <LinkTo> the same way.
    if (this.router.currentURL === null) {
      try {
        return this.router.urlFor(...routeArgs);
      } catch {
        return undefined;
      }
    }

    return this.router.urlFor(...routeArgs);
  }

  // A loading link is never active, as with <LinkTo>. `current-when` names are
  // external routes, resolved like `@route` (as v1 <LinkToExternal> does), and
  // checked without this link's models or query (as <LinkTo> does).
  get isActive() {
    if (this.isLoading) return false;

    let currentWhen = this.args['current-when'];
    if (typeof currentWhen === 'boolean') return currentWhen;
    if (typeof currentWhen === 'string') {
      return currentWhen.split(' ').some((name) => this.router.isActive(this.externalRoute(name)));
    }

    return this.router.isActive(...this.routeArgs);
  }

  navigate = (event) => {
    if (event.defaultPrevented || event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    // Leave links that open in another browsing context to the browser.
    let target = event.currentTarget.target;
    if (target && target !== '_self') return;

    event.preventDefault();

    // Like <LinkTo>, a loading link does nothing.
    if (this.isLoading) return;

    if (this.args.replace) {
      this.router.replaceWith(...this.routeArgs);
    } else {
      this.router.transitionTo(...this.routeArgs);
    }
  };

  <template>
    <a
      href={{this.href}}
      class={{if this.isActive "active"}}
      {{on "click" this.navigate}}
      ...attributes
    >{{yield}}</a>
  </template>
}
