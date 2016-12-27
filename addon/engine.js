import Ember from 'ember';
import EngineScopedLinkComponent from './-private/link-to-component';
import ExternalLinkComponent from './-private/link-to-external-component';

// Load extensions to Ember
import './-private/route-ext';
import './-private/router-ext';
import './-private/engine-instance-ext';

const { Engine } = Ember;

export default Engine.extend({
  buildRegistry() {
    let registry = this._super(...arguments);

    if (!(this instanceof Ember.Application)) {
      registry.register('component:link-to', EngineScopedLinkComponent);
      registry.register('component:link-to-external', ExternalLinkComponent);
    }

    return registry;
  }
});
