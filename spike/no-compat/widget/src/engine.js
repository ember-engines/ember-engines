import Engine from 'ember-engines-runtime/engine';

(globalThis.__engineLoads ??= []).push('widget');

// A routeless engine: no route map and no `lazy-engine`. The host renders it
// with {{mount "widget"}}, which builds the instance from the host's owner.
export default class WidgetEngine extends Engine {
  modules = import.meta.glob('./{templates,components,services}/**/*.{js,gjs,ts,gts}', {
    eager: true,
  });
  engineName = 'widget';
  dependencies = { services: ['session'] };
}
