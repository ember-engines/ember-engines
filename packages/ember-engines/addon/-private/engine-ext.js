import Application from '@ember/application';
import EngineScopedLinkComponent from '../components/link-to-component';
import ExternalLinkComponent from '../components/link-to-external';
import EngineRouterService from '../services/engine-router-service';
import Engine from '@ember/engine';

Engine.reopen({
  buildRegistry() {
    let registry = this._super(...arguments);

    if (!(this instanceof Application)) {
      registry.register('component:link-to', EngineScopedLinkComponent);
      registry.register('component:link-to-external', ExternalLinkComponent);
      registry.register('service:router', EngineRouterService);
    }

    return registry;
  },
});
