import Application from '@ember/application';
import Engine from '@ember/engine';
import require from 'require';
import { gte } from 'ember-compatibility-helpers';

import ExternalLinkComponent from '../components/link-to-external';

Engine.reopen({
  buildRegistry() {
    let registry = this._super(...arguments);

    if (!(this instanceof Application)) {
      if (!gte('ember-source', '3.24.1')) {
        const EngineScopedLinkComponent = require('../components/link-to-component').default;
        registry.register('component:link-to', EngineScopedLinkComponent);
      }
      registry.register('component:link-to-external', ExternalLinkComponent);
    }

    return registry;
  },
});
