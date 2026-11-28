import Service from '@ember/service';
import { getOwner } from '@ember/owner';
import { dependentKeyCompat } from '@ember/object/compat';
import { assert } from '@ember/debug';
import { rootOwner } from '../-private/root-owner.js';

// As with Ember's RouterService, an empty string or one starting with `/` is a
// URL, not a route name.
function isURL(name) {
  return name === '' || name[0] === '/';
}

// An engine's `service:router`: the host's router service, with route names
// inside the engine and `*External` methods for its `externalRoutes`. The
// engine base class registers it on each instance, so nothing is reopened.
// Route events are the host's, so listeners belong to the host's router and
// should be removed like any RouterService listener.
export default class EngineRouterService extends Service {
  #engine = getOwner(this);
  #host = rootOwner(this.#engine).lookup('service:router');

  #routeName(name) {
    let { mountPoint } = this.#engine;
    return name === 'application' ? mountPoint : `${mountPoint}.${name}`;
  }

  #externalRouteName(name) {
    return this.#engine._getExternalRoute(name);
  }

  // A leading string names a route; models or query params on their own apply
  // to the current route, as with Ember's RouterService.
  #transitionArgs(args) {
    let [name, ...rest] = args;
    if (typeof name !== 'string') return args;
    if (isURL(name)) return [name];
    return [this.#routeName(name), ...rest];
  }

  // The host's router service, as ember-engines-router-service exposed it.
  get externalRouter() {
    return this.#host;
  }

  @dependentKeyCompat
  get rootURL() {
    return this.#host.rootURL;
  }

  @dependentKeyCompat
  get currentURL() {
    return this.#host.currentURL;
  }

  @dependentKeyCompat
  get currentRouteName() {
    let name = this.#host.currentRouteName;
    let { mountPoint } = this.#engine;

    // Nothing has transitioned yet, as in a rendering test.
    if (!name) return name;
    if (name === mountPoint) return 'application';
    return name.slice(mountPoint.length + 1);
  }

  transitionTo(...args) {
    return this.#host.transitionTo(...this.#transitionArgs(args));
  }

  replaceWith(...args) {
    return this.#host.replaceWith(...this.#transitionArgs(args));
  }

  urlFor(name, ...args) {
    return this.#host.urlFor(this.#routeName(name), ...args);
  }

  isActive(name, ...args) {
    return this.#host.isActive(this.#routeName(name), ...args);
  }

  // Without a name, every active route of the engine, as RouterService#refresh
  // does for the app. The host's router looks its pivot route up on the host,
  // which can't see engine routes, so the engine's route refreshes itself.
  refresh(name) {
    let pivot = name || 'application';
    if (isURL(pivot)) return this.#host.refresh(pivot);

    let route = this.#engine.lookup(`route:${pivot}`);
    assert(`The route "${pivot}" was not found`, route);
    assert(`The route "${pivot}" is currently not active`, this.isActive(pivot));
    return route.refresh();
  }

  transitionToExternal(name, ...args) {
    return this.#host.transitionTo(this.#externalRouteName(name), ...args);
  }

  replaceWithExternal(name, ...args) {
    return this.#host.replaceWith(this.#externalRouteName(name), ...args);
  }

  urlForExternal(name, ...args) {
    return this.#host.urlFor(this.#externalRouteName(name), ...args);
  }

  isActiveExternal(name, ...args) {
    return this.#host.isActive(this.#externalRouteName(name), ...args);
  }

  refreshExternal(name, ...args) {
    return this.#host.refresh(this.#externalRouteName(name), ...args);
  }

  // Evented's forms, including `(name, target, method)`.
  on(...args) {
    this.#host.on(...args);
    return this;
  }

  one(...args) {
    this.#host.one(...args);
    return this;
  }

  off(...args) {
    this.#host.off(...args);
    return this;
  }

  has(name) {
    return this.#host.has(name);
  }
}
