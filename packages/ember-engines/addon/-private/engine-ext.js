import Application from '@ember/application';
import Engine from '@ember/engine';

import ExternalLinkComponent from '../components/link-to-external';

Engine.reopen({
  buildRegistry() {
    let registry = this._super(...arguments);

    if (!(this instanceof Application)) {
      registry.register('component:link-to-external', ExternalLinkComponent);
    }

    return registry;
  },
});
