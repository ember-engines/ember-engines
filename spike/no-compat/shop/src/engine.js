import Engine from 'ember-engines-runtime/engine';

(globalThis.__engineLoads ??= []).push('shop');

// No `lazy-engine` in package.json: the host bundles this engine and registers
// it at boot, so entering it loads nothing.
export default class ShopEngine extends Engine {
  modules = import.meta.glob('./{templates,routes,controllers,services}/**/*.{js,gjs,ts,gts}', {
    eager: true,
  });
  engineName = 'shop';
  dependencies = { services: ['session'] };
}
