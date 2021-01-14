import Application from '@ember/application';
import Engine from '@ember/engine';

import { macroCondition, dependencySatisfies, importSync } from '@embroider/macros';

import ExternalLinkComponent from '../components/link-to-external';

Engine.reopen({
  buildRegistry() {
    let registry = this._super(...arguments);

    if (!(this instanceof Application)) {
      if (macroCondition(!dependencySatisfies('ember-source', '>= 3.24.1'))) {
        const EngineScopedLinkComponent = importSync('../components/link-to-component').default;
        registry.register('component:link-to', EngineScopedLinkComponent);
      }
      registry.register('component:link-to-external', ExternalLinkComponent);
    }

    return registry;
  },
});
