// blog is built with tsdown + @nullvoxpopuli/ember-rolldown (from
// NullVoxPopuli/ember.nvp). It expands import.meta.glob, compiles Sass through
// @tsdown/css and keeps the CSS import in engine.js, with no custom plugins.
// comments uses rollup + @embroider/addon-dev, so CI covers both paths.
import { defineConfig } from 'tsdown';
import { ember } from '@nullvoxpopuli/ember-rolldown';

export default defineConfig({
  entry: ['./src/engine.js', './src/routes.js'],
  dts: false,
  css: { inject: true },
  plugins: [ember({ babel: false })],
});
