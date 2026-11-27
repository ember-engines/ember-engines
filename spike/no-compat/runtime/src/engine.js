import Engine, { getEngineParent } from '@ember/engine';
import EngineInstance from '@ember/engine/instance';
import { assert } from '@ember/debug';

// The engine side of the host/engine contract, without patching Ember.
//
// Engines extend this instead of `@ember/engine`. Ember builds every engine
// instance through the public `Engine#buildInstance`, so the contract lives in
// an `EngineInstance` subclass. It wires the host's services and external
// routes in the public `boot()`, after Ember has set the engine's parent and
// before anything in the engine is looked up.
//
// The host side is unchanged from ember-engines: the parent's `engines` map,
// keyed by engine name, lists `dependencies: { services, externalRoutes }`.
// A service entry can rename: `{ localName: 'hostName' }`.
//
// One private call remains: `ensureInitializers()`, which the stock
// `buildInstance` makes before creating the instance.

function serviceMap(entries = []) {
  let map = Object.create(null);
  for (let entry of entries) {
    if (typeof entry === 'string') {
      map[entry] = entry;
    } else {
      for (let [local, host] of Object.entries(entry)) map[local] = host;
    }
  }
  return map;
}

class ContractEngineInstance extends EngineInstance {
  // ember-engines' field name: ember-engines-router-service reads
  // `owner._externalRoutes` directly.
  _externalRoutes = Object.create(null);
  #wired = false;

  boot(options) {
    if (!this.#wired) {
      this.#wired = true;
      this.#wire();
    }
    return super.boot(options);
  }

  #wire() {
    let name = this.base.engineName;
    assert('An engine that extends ember-engines-runtime/engine must set `engineName`.', name);

    let parent = getEngineParent(this);
    let provided = parent.base.engines?.[name]?.dependencies ?? {};
    let required = this.base.dependencies ?? {};
    let services = serviceMap(provided.services);

    for (let local of required.services ?? []) {
      let host = services[local];
      assert(`Engine '${name}' requires service '${local}', but its parent's \`engines.${name}.dependencies.services\` doesn't provide it.`, host);
      let service = parent.lookup(`service:${host}`);
      assert(`Engine '${name}': the parent has no service '${host}'.`, service);
      this.register(`service:${local}`, service, { instantiate: false });
    }

    // A list of names; a map's keys are accepted too.
    let requiredRoutes = Array.isArray(required.externalRoutes)
      ? required.externalRoutes
      : Object.keys(required.externalRoutes ?? {});

    for (let local of requiredRoutes) {
      let route = provided.externalRoutes?.[local];
      assert(`Engine '${name}' requires external route '${local}', but its parent's \`engines.${name}.dependencies.externalRoutes\` doesn't map it.`, route);
      this._externalRoutes[local] = route;
    }
  }

  // The name ember-engines uses, so LinkToExternal and
  // ember-engines-router-service keep working unchanged.
  _getExternalRoute(local) {
    let route = this._externalRoutes[local];
    assert(`The external route ${local} does not exist`, route);
    return route;
  }
}

export default class ContractEngine extends Engine {
  buildInstance(options = {}) {
    this.ensureInitializers();
    return ContractEngineInstance.create({ ...options, base: this });
  }
}
