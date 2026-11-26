import Engine from '@ember/engine';
import './styles.scss';

(globalThis.__engineLoads ??= []).push('comments');

export default class CommentsEngine extends Engine {
  modules = import.meta.glob('./{templates,routes,controllers,services}/**/*.{js,gjs,ts,gts}', {
    eager: true,
  });

  dependencies = { services: ['session'], externalRoutes: ['home'] };
}
