import emberRequire from './-private/ext-require';

// Because feature flags are only valid for Ember canary builds,
// `Ember.EngineInstance` won't be exposed publicly for beta builds. This export
// provides a means to use this module with any ember build which privately
// includes the `engine-instance` module.
export default emberRequire('ember-application/system/engine-instance');
