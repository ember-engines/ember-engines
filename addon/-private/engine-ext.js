import Ember from 'ember';
import EngineScopedLinkComponent from './link-to-component';
import ExternalLinkComponent from './link-to-external-component';
import emberRequire from './ext-require';

const Engine = emberRequire('ember-application/system/engine');

const {
  ComponentLookup
} = Ember;

Engine.reopen({
  buildRegistry() {
    let registry = this._super(...arguments);

    if (!(this instanceof Ember.Application)) {
      registry.register('component:link-to', EngineScopedLinkComponent);
      registry.register('component:link-to-external', ExternalLinkComponent);
      registry.register('component-lookup:main', ComponentLookup);
    }

    return registry;
  }
});
