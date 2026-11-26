import { defineConfig, defaultClientConditions } from 'vite';
import { extensions, classicEmberSupport, ember } from '@embroider/vite';
import { babel } from '@rollup/plugin-babel';

export default defineConfig(({ command }) => ({
  resolve: {
    conditions:
      command === 'serve' ? ['workspace-source', ...defaultClientConditions] : defaultClientConditions,
  },
  plugins: [classicEmberSupport(), ember(), babel({ babelHelpers: 'runtime', extensions })],
}));
