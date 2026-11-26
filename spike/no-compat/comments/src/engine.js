import Engine from 'ember-engines-runtime/engine';
import './styles.scss';

(globalThis.__engineLoads ??= []).push('comments');

export default class CommentsEngine extends Engine {
  modules = import.meta.glob('./{templates,routes,controllers,services}/**/*.{js,gjs,ts,gts}', {
    eager: true,
  });

  engineName = 'comments';

  dependencies = { services: ['session'], externalRoutes: ['home'] };
}
