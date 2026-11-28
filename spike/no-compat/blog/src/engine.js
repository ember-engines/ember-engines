import Engine from 'ember-engines-runtime/engine';
import * as UiIntl from 'ui-kit/services/ui-intl';
import './styles.scss';

(globalThis.__engineLoads ??= []).push('blog');

export default class BlogEngine extends Engine {
  modules = {
    ...import.meta.glob('./{templates,routes,controllers,services}/**/*.{js,gjs,ts,gts}', {
      eager: true,
    }),
    // With compat, ui-kit's app-js put this in the engine's namespace. A strict
    // resolver needs it listed, because ui-kit components look it up by name.
    './services/ui-intl': UiIntl,
  };

  engineName = 'blog';

  dependencies = { services: ['session'], externalRoutes: ['home', 'item', 'other'] };
}
