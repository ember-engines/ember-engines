import Component from '@glimmer/component';
import { getOwner } from '@ember/owner';
import { getEngineParent } from '@ember/engine';
import { on } from '@ember/modifier';

function rootOwner(owner) {
  let parent;
  while ((parent = getEngineParent(owner))) {
    owner = parent;
  }
  return owner;
}

// Links to a route the host bound to one of this engine's `externalRoutes`.
// Resolves through the engine instance, then navigates with the host's router.
export default class LinkToExternal extends Component {
  get router() {
    return rootOwner(getOwner(this)).lookup('service:router');
  }

  get routeName() {
    return getOwner(this)._getExternalRoute(this.args.route);
  }

  get routeArgs() {
    let models = this.args.models ?? ('model' in this.args ? [this.args.model] : []);
    if (this.args.query) {
      return [this.routeName, ...models, { queryParams: this.args.query }];
    }
    return [this.routeName, ...models];
  }

  get href() {
    return this.router.urlFor(...this.routeArgs);
  }

  // HDS passes @current-when through; it is a boolean or host route names.
  get isActive() {
    let currentWhen = this.args['current-when'] ?? this.args.currentWhen;
    if (typeof currentWhen === 'boolean') return currentWhen;
    if (typeof currentWhen === 'string') {
      return currentWhen.split(' ').some((name) => this.router.isActive(name));
    }
    return this.router.isActive(...this.routeArgs);
  }

  navigate = (event) => {
    if (event.defaultPrevented || event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
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
