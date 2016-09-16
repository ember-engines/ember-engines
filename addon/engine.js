import Ember from 'ember';
import EngineScopedLinkComponent from './-private/link-to-component';
import ExternalLinkComponent from './-private/link-to-external-component';

const { Engine } = Ember;

export function registerComponents(registry) {
  registry.register('component:link-to', EngineScopedLinkComponent);
  registry.register('component:link-to-external', ExternalLinkComponent);
}

export default Engine.extend({
  buildRegistry() {
    let registry = this._super(...arguments);

    if (!(this instanceof Ember.Application) && !registry.has('component:link-to-external')) {
      registerComponents(registry);
    }

    return registry;
  }
});
